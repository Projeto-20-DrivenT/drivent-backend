import registrationRepository from "@/repositories/registration-repository";

async function createRegistration(userId: number, actitityId: number) {
  const result = await registrationRepository.createRegistration(userId, actitityId);
  return result;
}

const registrationService = {
  createRegistration,
};

export default registrationService;
