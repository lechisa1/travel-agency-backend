import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    phone: string | null;
    roles: string[];
  };
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  roles: string[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        user_roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone ?? null,
      roles: user.user_roles.map((ur) => ur.role.name),
    };
  }

  private async generateTokens(user: AuthenticatedUser): Promise<{
    access_token: string;
    refresh_token: string;
  }> {
    const roles = user.roles;
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    const refreshPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    const accessTokenSecret =
      this.configService.get<string>('JWT_SECRET') || 'fallback_secret';
    const accessTokenExpiresIn =
      this.configService.get<string>('JWT_EXPIRES_IN') || '1d';
    const refreshTokenSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'refresh_fallback_secret';
    const refreshTokenExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d';

    const access_token = this.jwtService.sign(accessPayload, {
      secret: accessTokenSecret,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expiresIn: accessTokenExpiresIn as any,
    });

    const refresh_token = this.jwtService.sign(refreshPayload, {
      secret: refreshTokenSecret,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      expiresIn: refreshTokenExpiresIn as any,
    });

    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(refreshTokenExpiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: refresh_token,
        expires_at: refreshTokenExpiresAt,
        revoked: false,
      },
    });

    return { access_token, refresh_token };
  }

  async login(user: AuthenticatedUser): Promise<LoginResponse> {
    const { access_token, refresh_token } = await this.generateTokens(user);

    return {
      access_token,
      refresh_token,
      user,
    };
  }

  async refresh(user: AuthenticatedUser): Promise<LoginResponse> {
    await this.prisma.refreshToken.updateMany({
      where: { user_id: user.id },
      data: { revoked: true },
    });

    const { access_token, refresh_token } = await this.generateTokens(user);

    return {
      access_token,
      refresh_token,
      user,
    };
  }

  async register(dto: RegisterDto): Promise<LoginResponse> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const customerRole = await this.prisma.role.findUnique({
      where: { name: 'customer' },
    });

    if (!customerRole) {
      throw new ConflictException('Default role not found');
    }

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password_hash: hashedPassword,
        full_name: dto.full_name,
        phone: dto.phone ?? null,
        is_active: true,
        user_roles: {
          create: { role: { connect: { id: customerRole.id } } },
        },
      },
      include: {
        user_roles: {
          include: {
            role: true,
          },
        },
      },
    });

    const authenticatedUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone ?? null,
      roles: user.user_roles.map((ur) => ur.role.name),
    };

    return this.login(authenticatedUser);
  }
}
