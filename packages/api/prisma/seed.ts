import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const libsql = createClient({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
})
const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || 'file:./prisma/dev.db' })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Clean existing data
  await prisma.appointment.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.psychologist.deleteMany()

  // Create admin user FIRST
  const admin = await prisma.psychologist.create({
    data: {
      email: 'facundo.galetta@gmail.com',
      name: 'Facundo Galetta',
      role: 'PSYCHOLOGIST',
      plan: 'FREE',
      passwordHash: '1e82e81cb776db520378a67e0978591690941c1bbe88323725299972567595b7',
    },
  })
  console.log('Created admin:', admin.email)

  // Create demo psychologist
  const psychologist = await prisma.psychologist.create({
    data: {
      email: 'demo.psychologist@psyapp.local',
      name: 'Dra. Ana López',
      role: 'PSYCHOLOGIST',
      plan: 'FREE',
      passwordHash: 'demo123hash',
    },
  })

  console.log('Created psychologist:', psychologist.id)

  // Create demo patient linked to the psychologist
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
  })

  console.log('Created patient:', patient.id)

  // Create a few demo appointments
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0)
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0)

  const tomorrowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 0, 0)
  const tomorrowEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 15, 0, 0)

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
  })

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
  })

  console.log('Created appointments:', appt1.id, appt2.id)

  // Create a demo note
  const note = await prisma.note.create({
    data: {
      psychologistId: psychologist.id,
      patientId: patient.id,
      appointmentId: appt1.id,
      content: 'El paciente refiere ansiedad leve relacionada con el trabajo. Se acordaron técnicas de respiración.',
      summary: 'Ansiedad leve laboral. Técnicas de respiración.',
    },
  })

  console.log('Created note:', note.id)

  // Create a demo payment
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
  })

  console.log('Created payment:', payment.id)

  console.log('\n✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
