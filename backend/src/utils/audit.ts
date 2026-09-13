import { PrismaClient } from '@prisma/client';
import { io } from '../index';

const prisma = new PrismaClient();

export const createAuditLog = async (data: {
  action: string;
  entity: string;
  entityId?: string;
  performedById?: string;
  details?: any;
}) => {
  try {
    const log = await prisma.auditLog.create({
      data: {
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        performedById: data.performedById,
        details: data.details
      }
    });

    if (io) {
      io.emit('auditLog', log);
    }

    return log;
  } catch (err) {
    console.error('Failed to create audit log:', err);
  }
};
