import { Module } from '@nestjs/common';
import { SmsTemplatesService } from './sms-templates.service';
import { SmsTemplatesController } from './sms-templates.controller';

@Module({
  providers: [SmsTemplatesService],
  controllers: [SmsTemplatesController],
  exports: [SmsTemplatesService],
})
export class SmsTemplatesModule {}