import { Module } from '@nestjs/common';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';
import { EvaluationCriteriaController } from './evaluation-criteria.controller';
import { EvaluationCriteriaService } from './evaluation-criteria.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [EvaluationsController, EvaluationCriteriaController],
  providers: [EvaluationsService, EvaluationCriteriaService, PrismaService],
  exports: [EvaluationsService, EvaluationCriteriaService],
})
export class EvaluationsModule {}
