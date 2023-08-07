import { notFoundError, unauthorizedError } from "@/errors";
import paymentRepository, { PaymentParams } from "@/repositories/payment-repository";
import ticketRepository from "@/repositories/ticket-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import userRepository from "@/repositories/user-repository";
import { Ticket,TicketType } from ".prisma/client";
import sgMail from "@sendgrid/mail"

async function verifyTicketAndEnrollment(ticketId: number, userId: number) {
  const ticket = await ticketRepository.findTickeyById(ticketId);

  if (!ticket) {
    throw notFoundError();
  }
  const enrollment = await enrollmentRepository.findById(ticket.enrollmentId);

  if (enrollment.userId !== userId) {
    throw unauthorizedError();
  }
}

async function getPaymentByTicketId(userId: number, ticketId: number) {
  await verifyTicketAndEnrollment(ticketId, userId);

  const payment = await paymentRepository.findPaymentByTicketId(ticketId);

  if (!payment) {
    throw notFoundError();
  }
  return payment;
}

async function paymentProcess(ticketId: number, userId: number, cardData: CardPaymentParams) {
  await verifyTicketAndEnrollment(ticketId, userId);

  const ticket = await ticketRepository.findTickeWithTypeById(ticketId);
  
  const paymentData = {
    ticketId,
    value: ticket.TicketType.price,
    cardIssuer: cardData.issuer,
    cardLastDigits: cardData.number.toString().slice(-4),
  };

  const payment = await paymentRepository.createPayment(ticketId, paymentData);

  await ticketRepository.ticketProcessPayment(ticketId);

  await paymentConfimationEmail(userId,ticket);

  return payment;
}

async function paymentConfimationEmail(userId: number, ticket: Ticket & {TicketType: TicketType}){
  sgMail.setApiKey(process.env.EMAIL_API_KEY);

  const enroll = await enrollmentRepository.findWithUserByuserId(userId);

  let text = `<h3>Prezado(a) ${enroll.name}</h3>, 
  <p>É com grande satisfação que recebemos o seu pagamento 
  referente ao Ticket ${ticket.TicketType.name} do tipo ${ticket.TicketType.isRemote? "remoto.</p>" : "presencial"}`

  if(!ticket.TicketType.isRemote){
    text += `${ticket.TicketType.includesHotel? " com Hotel.</p>" : " sem Hotel.</p> "} `
  }
  text += `
  <p>O seu lugar está garantido e estamos ansiosos para recebê-lo(a) em nosso evento.
  Agradecemos a sua participação e estamos à disposição para qualquer informação adicional.</p>`

  const msg = {
    to: `${enroll.User.email}`,
    from: `${process.env.EMAIL}`,
    subject: `Confirmação de Pagamento - Ticket ${ticket.TicketType.name}`,
    html: text,
  }

  try {
    await sgMail.send(msg);
  } catch(err){
    console.log(err.response.body)
  }
}

export type CardPaymentParams = {
  issuer: string,
  number: number,
  name: string,
  expirationDate: Date,
  cvv: number
}

const paymentService = {
  getPaymentByTicketId,
  paymentProcess,
};

export default paymentService;
