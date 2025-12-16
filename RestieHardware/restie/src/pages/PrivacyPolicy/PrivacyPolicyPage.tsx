import React from 'react';
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonIcon,
} from '@ionic/react';
import { arrowBack } from 'ionicons/icons';
import './PrivacyPolicyPage.css';

const PrivacyPolicyPage: React.FC = () => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home" icon={arrowBack} />
                    </IonButtons>
                    <IonTitle>Privacy Policy</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="privacy-policy-content">
                <div className="privacy-policy-container">
                    <h1>Privacy Policy for RestieHardware</h1>
                    <p className="last-updated"><strong>Last Updated: December 16, 2025</strong></p>

                    <section>
                        <h2>Introduction</h2>
                        <p>
                            Welcome to RestieHardware ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application, website, and services, including interactions through Facebook Messenger.
                        </p>
                    </section>

                    <section>
                        <h2>Information We Collect</h2>

                        <h3>Personal Information You Provide</h3>
                        <p>When you use our services, we may collect:</p>
                        <ul>
                            <li><strong>Account Information:</strong> Name, email address, phone number, and password</li>
                            <li><strong>Profile Information:</strong> Delivery address, billing information</li>
                            <li><strong>Order Information:</strong> Purchase history, product preferences, payment details</li>
                            <li><strong>Communication Data:</strong> Messages sent through our Facebook Messenger bot, customer support inquiries</li>
                            <li><strong>Facebook Information:</strong> If you interact with us through Facebook Messenger, we may receive your Facebook User ID, profile name, and profile picture as permitted by Facebook's platform</li>
                        </ul>

                        <h3>Automatically Collected Information</h3>
                        <ul>
                            <li><strong>Device Information:</strong> Device type, operating system, unique device identifiers</li>
                            <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the app</li>
                            <li><strong>Location Data:</strong> Approximate location based on IP address (with your consent for precise location)</li>
                            <li><strong>Cookies and Tracking:</strong> We use cookies and similar technologies to enhance user experience</li>
                        </ul>
                    </section>

                    <section>
                        <h2>How We Use Your Information</h2>
                        <p>We use your information to:</p>
                        <ul>
                            <li><strong>Provide Services:</strong> Process orders, deliver products, manage your account</li>
                            <li><strong>Communicate:</strong> Send order confirmations, delivery updates, respond to inquiries via Messenger or other channels</li>
                            <li><strong>Improve Services:</strong> Analyze usage patterns, develop new features, enhance user experience</li>
                            <li><strong>Marketing:</strong> Send promotional offers, product recommendations (with your consent)</li>
                            <li><strong>Security:</strong> Detect fraud, protect against unauthorized access</li>
                            <li><strong>Legal Compliance:</strong> Comply with applicable laws and regulations</li>
                        </ul>
                    </section>

                    <section>
                        <h2>Facebook Messenger Integration</h2>
                        <p>When you interact with our Facebook Messenger bot:</p>
                        <ul>
                            <li>We receive and store your messages to provide product information and customer support</li>
                            <li>Your Facebook User ID is used to maintain conversation context</li>
                            <li>We do not share your Messenger conversations with third parties except as required by law</li>
                            <li>You can stop receiving messages by blocking our page or typing "STOP"</li>
                        </ul>
                    </section>

                    <section>
                        <h2>How We Share Your Information</h2>

                        <h3>Service Providers</h3>
                        <ul>
                            <li>Payment processors (for secure transactions)</li>
                            <li>Shipping and delivery partners</li>
                            <li>Cloud hosting providers</li>
                            <li>Analytics services</li>
                            <li>Facebook (as our Messenger platform provider)</li>
                        </ul>

                        <h3>Legal Requirements</h3>
                        <ul>
                            <li>Law enforcement or government agencies when required by law</li>
                            <li>To protect our rights, property, or safety</li>
                            <li>In connection with business transfers (mergers, acquisitions)</li>
                        </ul>

                        <h3>With Your Consent</h3>
                        <p>Any other parties with your explicit consent</p>

                        <p className="highlight">We <strong>do not sell</strong> your personal information to third parties.</p>
                    </section>

                    <section>
                        <h2>Data Security</h2>
                        <p>We implement appropriate technical and organizational measures to protect your data:</p>
                        <ul>
                            <li>Encryption of data in transit and at rest</li>
                            <li>Secure authentication mechanisms (JWT tokens)</li>
                            <li>Regular security assessments</li>
                            <li>Access controls and monitoring</li>
                        </ul>
                        <p>However, no method of transmission over the internet is 100% secure.</p>
                    </section>

                    <section>
                        <h2>Your Rights and Choices</h2>
                        <p>You have the right to:</p>
                        <ul>
                            <li><strong>Access:</strong> Request a copy of your personal data</li>
                            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                            <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
                            <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                            <li><strong>Data Portability:</strong> Receive your data in a structured format</li>
                            <li><strong>Withdraw Consent:</strong> Stop allowing us to process your data where consent is the legal basis</li>
                        </ul>
                        <p>To exercise these rights, contact us at: <a href="mailto:edwardjosephfernandez@gmail.com">edwardjosephfernandez@gmail.com</a></p>
                    </section>

                    <section>
                        <h2>Data Retention</h2>
                        <p>We retain your personal information for as long as necessary to:</p>
                        <ul>
                            <li>Fulfill the purposes outlined in this Privacy Policy</li>
                            <li>Comply with legal obligations (e.g., tax records)</li>
                            <li>Resolve disputes and enforce agreements</li>
                        </ul>
                    </section>

                    <section>
                        <h2>Children's Privacy</h2>
                        <p>Our services are not intended for children under 13. We do not knowingly collect information from children under 13. If you believe we have collected such information, please contact us.</p>
                    </section>

                    <section>
                        <h2>International Data Transfers</h2>
                        <p>Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data.</p>
                    </section>

                    <section>
                        <h2>Facebook Platform Compliance</h2>
                        <p>Our use of Facebook services complies with:</p>
                        <ul>
                            <li>Facebook Platform Terms</li>
                            <li>Facebook Platform Policy</li>
                            <li>Facebook Messenger Platform Policy</li>
                        </ul>
                        <p>We use the Facebook Messenger API solely to provide customer service and product information as described in this policy.</p>
                    </section>

                    <section>
                        <h2>Changes to This Privacy Policy</h2>
                        <p>We may update this Privacy Policy periodically. We will notify you of material changes by:</p>
                        <ul>
                            <li>Posting the updated policy on our website/app</li>
                            <li>Sending an email notification (if applicable)</li>
                            <li>Displaying a notice in the app</li>
                        </ul>
                        <p>Your continued use after changes constitutes acceptance of the updated policy.</p>
                    </section>

                    <section>
                        <h2>Contact Us</h2>
                        <p>If you have questions or concerns about this Privacy Policy or our data practices:</p>
                        <div className="contact-info">
                            <p><strong>RestieHardware</strong></p>
                            <p>Email: <a href="mailto:edwardjosephfernandez@gmail.com">edwardjosephfernandez@gmail.com</a></p>
                            <p>Address: Blk 77 Lot 31 Amber Street, Deca Homes Talomo, Davao City, Philippines</p>
                            <p>Phone: <a href="tel:+639208400489">+63 920 840 0489</a></p>
                        </div>
                        <p>For Facebook Messenger-specific inquiries, you can also message us directly through our Facebook Page.</p>
                    </section>

                    <section>
                        <h2>Specific Provisions for Philippine Users</h2>
                        <p>If you are in the Philippines, this policy complies with the Data Privacy Act of 2012 (Republic Act No. 10173). You may file complaints with the National Privacy Commission.</p>
                    </section>

                    <section>
                        <h2>Cookie Policy</h2>

                        <h3>What Are Cookies</h3>
                        <p>Cookies are small text files stored on your device. We use cookies to:</p>
                        <ul>
                            <li>Remember your preferences</li>
                            <li>Understand how you use our services</li>
                            <li>Improve website performance</li>
                        </ul>

                        <h3>Types of Cookies We Use</h3>
                        <ul>
                            <li><strong>Essential Cookies:</strong> Required for the website to function</li>
                            <li><strong>Analytics Cookies:</strong> Help us understand user behavior</li>
                            <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                        </ul>
                        <p>You can control cookies through your browser settings.</p>
                    </section>

                    <section className="consent-section">
                        <h2>Consent</h2>
                        <p>
                            By using RestieHardware services, including our Facebook Messenger bot, you acknowledge that you have read and understood this Privacy Policy and consent to the collection, use, and disclosure of your information as described herein.
                        </p>
                    </section>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default PrivacyPolicyPage;
