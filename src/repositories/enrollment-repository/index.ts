import { prisma } from "@/config";
import { Enrollment, Prisma, PrismaClient } from "@prisma/client";
import { CreateAddressParams, UpdateAddressParams } from "../address-repository";

async function findWithAddressByUserId(userId: number) {
  return prisma.enrollment.findFirst({
    where: { userId },
    include: {
      Address: true,
    },
  });
}

async function findById(enrollmentId: number) {
  return prisma.enrollment.findFirst({
    where: { id: enrollmentId },
  });
}

async function upsert(
  userId: number,
  createdEnrollment: CreateEnrollmentParams,
  updatedEnrollment: UpdateEnrollmentParams,
) {
  return prisma.enrollment.upsert({
    where: {
      userId,
    },
    create: createdEnrollment,
    update: updatedEnrollment,
  });
}

async function findWithUserByuserId(userId: number) {
  return prisma.enrollment.findFirst({
    where: { userId },
    include: {
      User: true,
    },
  });
}

async function createOrUpdateEnrollmentAndAddress(
  enrollmentId: number,
  userId: number,
  createdEnrollment: CreateEnrollmentParams,
  createdAddress: CreateAddressParams,
) {
  const enrollmentData = {
    name: createdEnrollment.name,
    cpf: createdEnrollment.cpf,
    birthday: createdEnrollment.birthday,
    phone: createdEnrollment.phone,
    userId: createdEnrollment.userId,
  };

  const addressData = {
    cep: createdAddress.cep,
    street: createdAddress.street,
    city: createdAddress.city,
    state: createdAddress.state,
    number: createdAddress.number,
    neighborhood: createdAddress.neighborhood,
    addressDetail: createdAddress.addressDetail,
  };

  return await prisma.enrollment.upsert({
    where: {
      userId,
    },
    create: {
      ...enrollmentData,
      Address: {
        create: {
          ...addressData,
        },
      },
    },
    update: {
      ...enrollmentData,
      Address: {
        update: {
          where: {
            enrollmentId,
          },
          data: {
            ...addressData,
          },
        },
      },
    },
  });
}

export type CreateEnrollmentParams = Omit<Enrollment, "id" | "createdAt" | "updatedAt">;
export type UpdateEnrollmentParams = Omit<CreateEnrollmentParams, "userId">;

const enrollmentRepository = {
  findWithAddressByUserId,
  upsert,
  findById,
  findWithUserByuserId,
  createOrUpdateEnrollmentAndAddress,
};

export default enrollmentRepository;
