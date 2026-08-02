const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config({ path: '/app/.env' });
dotenv.config({ path: './.env' });
dotenv.config();

console.log('🚀 Démarrage du script test-smtp.js (Pure JS)...');

async function testSmtpConnection() {
  const targetEmail = process.argv[2] || 'kpsydesk.support@kpsyinformatique.com';
  
  const host = process.env.SMTP_HOST || 'smtp.hostinger.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

  console.log('--------------------------------------------------');
  console.log('🧪 TEST DE CONNEXION SMTP (Hostinger Port 465 SSL)');
  console.log('--------------------------------------------------');
  console.log(`Hôte         : ${host}`);
  console.log(`Port         : ${port}`);
  console.log(`SSL Implicite: ${isSecure}`);
  console.log(`Utilisateur  : ${process.env.SMTP_USER || 'kpsydesk.support@kpsyinformatique.com'}`);
  console.log(`Mot de passe : ${process.env.SMTP_PASS ? '******** (Renseigné)' : '❌ VIDE OU NON CHARGÉ !'}`);
  console.log(`Destinataire : ${targetEmail}`);
  console.log('--------------------------------------------------');

  if (!process.env.SMTP_PASS) {
    console.error('❌ ERREUR : La variable SMTP_PASS est vide ! Ajoutez SMTP_PASS=votre_mot_de_passe dans votre /opt/kpsyschool/.env');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_USER || 'kpsydesk.support@kpsyinformatique.com',
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('⏳ Vérification de la poignée de main TLS/SSL...');
    await transporter.verify();
    console.log('✅ Connexion SMTP Hostinger 465 SSL RÉUSSIE !');

    console.log(`⏳ Envoi d'un email de test à ${targetEmail}...`);
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"KPSyDesk School" <kpsydesk.support@kpsyinformatique.com>',
      to: targetEmail,
      subject: '[KPSyDesk School] Test de configuration SMTP Port 465 SSL',
      text: `Félicitations ! Votre configuration SMTP Hostinger sur le port 465 SSL est fonctionnelle.\n\nDate: ${new Date().toISOString()}`,
    });

    console.log('--------------------------------------------------');
    console.log(`🎉 TEST RÉUSSI ! Message ID: ${info.messageId}`);
    console.log('--------------------------------------------------');
  } catch (err) {
    console.error('--------------------------------------------------');
    console.error('❌ ÉCHEC DU TEST SMTP :', err.message);
    console.error('--------------------------------------------------');
    process.exit(1);
  }
}

testSmtpConnection();
