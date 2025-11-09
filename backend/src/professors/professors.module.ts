import { Module } from '@nestjs/common';
import { ProfessorsController } from './professors.controller';
import { ProfessorsService } from './professors.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [ProfessorsController],
  providers: [ProfessorsService, PrismaService],
  exports: [ProfessorsService],
})
export class ProfessorsModule {}
