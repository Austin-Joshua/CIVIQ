import { PrismaClient } from '@prisma/client';
import { tenantContext } from './tenantContext.js';

const basePrisma = new PrismaClient();

const tenantModels = ['User', 'Zone', 'Bin', 'Vehicle', 'Route', 'Alert', 'AuditLog'];

const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const tenantId = tenantContext.getStore();
        
        if (tenantId && tenantModels.includes(model)) {
          if (['findFirst', 'findFirstOrThrow', 'findMany', 'count', 'updateMany', 'deleteMany', 'aggregate', 'groupBy'].includes(operation)) {
            // @ts-ignore
            args.where = { ...args.where, organizationId: tenantId };
          } else if (['update', 'delete'].includes(operation)) {
             // Let developers handle single updates carefully or fallback to updateMany for multi-tenant enforcement
             // The existing codebase uses explicit organizationId in unique queries often, so we let those pass.
          } else if (operation === 'create') {
             // @ts-ignore
             args.data = { ...args.data, organizationId: tenantId };
          } else if (operation === 'createMany') {
             // @ts-ignore
             if (Array.isArray(args.data)) {
                // @ts-ignore
                args.data = args.data.map((d: any) => ({ ...d, organizationId: tenantId }));
             }
          }
        }
        return query(args);
      },
    },
  },
});

export default prisma;
