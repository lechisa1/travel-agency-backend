import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupMemberInlineDto } from './create-group-member.dto';

export class UpdateGroupMemberDto extends PartialType(CreateGroupMemberInlineDto) {}