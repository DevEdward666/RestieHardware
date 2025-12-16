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
import './TermsOfServicePage.css';

const TermsOfServicePage: React.FC = () => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home" icon={arrowBack} />
                    </IonButtons>
                    <IonTitle>Terms of Service</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen className="terms-content">
                <div className="terms-container">
                    <h1>Terms of Service</h1>
                    <p className="last-updated"><strong>Last Updated: December 16, 2025</strong></p>

                    <section>
                        <h2>1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using RestieHardware's mobile application, website, and services ("Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Services.
                        </p>
                    </section>

                    <section>
                        <h2>2. Description of Services</h2>
                        <p>RestieHardware provides:</p>
                        <ul>
                            <li>E-commerce platform for hardware products</li>
                            <li>Online ordering and delivery services</li>
                            <li>Product information and catalog browsing</li>
                            <li>Customer support via Facebook Messenger and other channels</li>
                            <li>Account management features</li>
                        </ul>
                    </section>

                    <section>
                        <h2>3. User Accounts</h2>

                        <h3>3.1 Registration</h3>
                        <p>To use certain features, you must create an account by providing accurate and complete information.</p>

                        <h3>3.2 Account Security</h3>
                        <ul>
                            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                            <li>You must notify us immediately of any unauthorized use</li>
                            <li>We are not liable for any loss resulting from unauthorized account access</li>
                        </ul>

                        <h3>3.3 Account Termination</h3>
                        <p>We reserve the right to suspend or terminate accounts that violate these Terms.</p>
                    </section>

                    <section>
                        <h2>4. Orders and Payments</h2>

                        <h3>4.1 Order Placement</h3>
                        <ul>
                            <li>All orders are subject to acceptance and product availability</li>
                            <li>We reserve the right to refuse or cancel any order</li>
                            <li>Prices are subject to change without notice</li>
                        </ul>

                        <h3>4.2 Payment</h3>
                        <ul>
                            <li>Payment must be made before order processing</li>
                            <li>We accept various payment methods as displayed in the app</li>
                            <li>All payments are processed securely</li>
                        </ul>

                        <h3>4.3 Pricing</h3>
                        <ul>
                            <li>All prices are in Philippine Peso (PHP)</li>
                            <li>Prices include applicable taxes unless stated otherwise</li>
                            <li>Delivery fees may apply based on location</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Delivery and Shipping</h2>
                        <ul>
                            <li>Delivery times are estimates and not guaranteed</li>
                            <li>You must provide accurate delivery information</li>
                            <li>Risk of loss transfers to you upon delivery</li>
                            <li>Delivery fees vary by location within Davao City and surrounding areas</li>
                        </ul>
                    </section>

                    <section>
                        <h2>6. Returns and Refunds</h2>

                        <h3>6.1 Return Policy</h3>
                        <ul>
                            <li>Returns accepted within 7 days for defective products</li>
                            <li>Products must be in original condition and packaging</li>
                            <li>Contact us to initiate a return</li>
                        </ul>

                        <h3>6.2 Refund Process</h3>
                        <ul>
                            <li>Approved returns will be refunded within 14 business days</li>
                            <li>Refunds processed through original payment method</li>
                            <li>Shipping fees are non-refundable unless error was ours</li>
                        </ul>
                    </section>

                    <section>
                        <h2>7. User Conduct</h2>
                        <p>You agree NOT to:</p>
                        <ul>
                            <li>Use the Services for any unlawful purpose</li>
                            <li>Interfere with or disrupt the Services</li>
                            <li>Attempt to gain unauthorized access to our systems</li>
                            <li>Impersonate any person or entity</li>
                            <li>Upload malicious code or viruses</li>
                            <li>Harass, abuse, or harm other users</li>
                        </ul>
                    </section>

                    <section>
                        <h2>8. Intellectual Property</h2>
                        <ul>
                            <li>All content on our Services is owned by RestieHardware or our licensors</li>
                            <li>You may not copy, modify, or distribute our content without permission</li>
                            <li>Product images and descriptions are for reference only</li>
                            <li>Our trademarks and logos may not be used without written consent</li>
                        </ul>
                    </section>

                    <section>
                        <h2>9. Limitation of Liability</h2>
                        <p>
                            To the maximum extent permitted by law, RestieHardware shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our Services.
                        </p>
                        <p>
                            Our total liability shall not exceed the amount you paid for the product or service in question.
                        </p>
                    </section>

                    <section>
                        <h2>10. Disclaimers</h2>
                        <ul>
                            <li>Services provided "as is" without warranties of any kind</li>
                            <li>We do not guarantee uninterrupted or error-free service</li>
                            <li>Product descriptions are based on manufacturer information</li>
                            <li>Actual products may vary slightly from images</li>
                        </ul>
                    </section>

                    <section>
                        <h2>11. Privacy</h2>
                        <p>
                            Your use of our Services is also governed by our <a href="/privacy">Privacy Policy</a>. Please review it to understand how we collect and use your information.
                        </p>
                    </section>

                    <section>
                        <h2>12. Facebook Messenger Terms</h2>
                        <p>When using our Facebook Messenger integration:</p>
                        <ul>
                            <li>You agree to Facebook's Terms of Service and Messenger Terms</li>
                            <li>We use Messenger solely for customer service and product inquiries</li>
                            <li>You can opt-out by blocking our page or typing "STOP"</li>
                            <li>Messenger conversations are subject to our Privacy Policy</li>
                        </ul>
                    </section>

                    <section>
                        <h2>13. Modifications to Terms</h2>
                        <p>
                            We reserve the right to modify these Terms at any time. Changes will be effective upon posting to the app. Your continued use constitutes acceptance of modified Terms.
                        </p>
                    </section>

                    <section>
                        <h2>14. Governing Law</h2>
                        <p>
                            These Terms are governed by the laws of the Republic of the Philippines. Any disputes shall be resolved in the courts of Davao City, Philippines.
                        </p>
                    </section>

                    <section>
                        <h2>15. Dispute Resolution</h2>
                        <ul>
                            <li>Contact us first to resolve any disputes informally</li>
                            <li>If unresolved, disputes may be submitted to mediation</li>
                            <li>Legal action may be taken as a last resort</li>
                        </ul>
                    </section>

                    <section>
                        <h2>16. Severability</h2>
                        <p>
                            If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
                        </p>
                    </section>

                    <section>
                        <h2>17. Force Majeure</h2>
                        <p>
                            We are not liable for delays or failures due to circumstances beyond our control, including natural disasters, government actions, pandemics, or other force majeure events.
                        </p>
                    </section>

                    <section>
                        <h2>18. Contact Information</h2>
                        <p>For questions about these Terms, please contact us:</p>
                        <div className="contact-info">
                            <p><strong>RestieHardware</strong></p>
                            <p>Email: <a href="mailto:edwardjosephfernandez@gmail.com">edwardjosephfernandez@gmail.com</a></p>
                            <p>Address: Blk 77 Lot 31 Amber Street, Deca Homes Talomo, Davao City, Philippines</p>
                            <p>Phone: <a href="tel:+639208400489">+63 920 840 0489</a></p>
                        </div>
                    </section>

                    <section className="acknowledgment-section">
                        <h2>Acknowledgment</h2>
                        <p>
                            By using RestieHardware's Services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                        </p>
                    </section>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default TermsOfServicePage;
