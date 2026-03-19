import 'dotenv/config';
import { sendOrderConfirmationEmail } from '@/lib/resend';

// Données de test pour simuler une commande
const testOrderData = {
  orderNumber: 'CMD-TEST-001',
  orderDate: new Date().toISOString(),
  customerEmail: 'perso.dsgjohnson@outlook.fr', // Email du compte Resend en mode test
  customerName: 'Jean Dupont',
  customerPhone: '06 12 34 56 78',
  orderItems: [
    {
      id: '1',
      type: 'STAGE',
      totalPrice: 450,
      depositAmount: 150,
      remainingAmount: 300,
      participantData: {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@example.com',
        phone: '06 12 34 56 78',
      },
      stage: {
        type: 'INITIATION',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Dans 7 jours
        price: 450,
      },
    },
    {
      id: '2',
      type: 'BAPTEME',
      totalPrice: 110,
      depositAmount: 60,
      remainingAmount: 50,
      participantData: {
        firstName: 'Marie',
        lastName: 'Dupont',
        email: 'marie.dupont@example.com',
        phone: '06 12 34 56 78',
        selectedCategory: 'AVENTURE',
        hasVideo: true,
      },
      bapteme: {
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Dans 3 jours
        acomptePrice: 35,
      },
    },
  ],
  depositTotal: 210,
  remainingTotal: 350,
  totalAmount: 560,
  discountAmount: 0,
  futurePayments: [
    {
      amount: 300,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Solde Stage INITIATION',
      participantName: 'Jean Dupont',
    },
    {
      amount: 50,
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Solde Baptême AVENTURE',
      participantName: 'Marie Dupont',
    },
  ],
};

async function testEmail() {
  
  try {
    const result = await sendOrderConfirmationEmail(testOrderData);
  } catch (error) {
    process.exit(1);
  }
}

testEmail();