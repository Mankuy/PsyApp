"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_libsql_1 = require("@prisma/adapter-libsql");
const client_2 = require("@libsql/client");
const libsql = (0, client_2.createClient)({
    url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
});
const adapter = new adapter_libsql_1.PrismaLibSql({ url: process.env.DATABASE_URL || 'file:./prisma/dev.db' });
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    await prisma.appointment.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.psychologist.deleteMany();
    const psychologist = await prisma.psychologist.create({
        data: {
            email: 'demo.psychologist@psyapp.local',
            name: 'Dra. Ana López',
            role: 'PSYCHOLOGIST',
            plan: 'FREE',
            passwordHash: 'demo123hash',
        },
    });
    console.log('Created psychologist:', psychologist.id);
    const patient = await prisma.patient.create({
        data: {
            email: 'demo.patient@example.com',
            name: 'Juan Pérez',
            psychologist: { connect: { id: psychologist.id } },
            phone: '+598 99 123 456',
            dateOfBirth: new Date('1990-05-15'),
            gender: 'male',
            passwordHash: 'demo123hash',
        },
    });
    console.log('Created patient:', patient.id);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
    const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 0, 0);
    const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 15, 0, 0);
    const appt1 = await prisma.appointment.create({
        data: {
            psychologistId: psychologist.id,
            patientId: patient.id,
            startTime: todayStart,
            endTime: todayEnd,
            type: 'INDIVIDUAL',
            status: 'SCHEDULED',
            title: 'Primera consulta',
            notes: 'Evaluación inicial del paciente.',
        },
    });
    const appt2 = await prisma.appointment.create({
        data: {
            psychologistId: psychologist.id,
            patientId: patient.id,
            startTime: tomorrowStart,
            endTime: tomorrowEnd,
            type: 'INDIVIDUAL',
            status: 'SCHEDULED',
            title: 'Seguimiento semanal',
            notes: 'Revisión de avances y tareas asignadas.',
        },
    });
    console.log('Created appointments:', appt1.id, appt2.id);
    const note = await prisma.note.create({
        data: {
            psychologistId: psychologist.id,
            patientId: patient.id,
            appointmentId: appt1.id,
            content: 'El paciente refiere ansiedad leve relacionada con el trabajo. Se acordaron técnicas de respiración.',
            summary: 'Ansiedad leve laboral. Técnicas de respiración.',
            sentimentScore: 0.65,
        },
    });
    console.log('Created note:', note.id);
    const payment = await prisma.payment.create({
        data: {
            psychologistId: psychologist.id,
            patientId: patient.id,
            appointmentId: appt1.id,
            amount: 1500,
            currency: 'UYU',
            type: 'SESSION',
            status: 'SUCCEEDED',
        },
    });
    console.log('Created payment:', payment.id);
    console.log('\n✅ Seed completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map