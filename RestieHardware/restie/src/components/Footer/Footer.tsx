import React from 'react';
import { IonFooter, IonToolbar, IonRow, IonCol, IonText } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
    const history = useHistory();

    const navigateToPrivacy = () => {
        history.push('/privacy');
    };

    const navigateToTerms = () => {
        history.push('/terms');
    };

    return (
        <IonFooter className="app-footer">
            <IonToolbar className="footer-toolbar">
                <IonRow className="footer-content">
                    <IonCol size="12" sizeMd="4" className="footer-section">
                        <h3>RestieHardware</h3>
                        <p>Your trusted hardware store in Davao City</p>
                    </IonCol>

                    <IonCol size="12" sizeMd="4" className="footer-section">
                        <h3>Contact Us</h3>
                        <p>Blk 77 Lot 31 Amber Street</p>
                        <p>Deca Homes Talomo, Davao City</p>
                        <p>Phone: +63 920 840 0489</p>
                        <p>Email: edwardjosephfernandez@gmail.com</p>
                    </IonCol>

                    <IonCol size="12" sizeMd="4" className="footer-section">
                        <h3>Legal</h3>
                        <p className="footer-link" onClick={navigateToPrivacy}>
                            Privacy Policy
                        </p>
                        <p className="footer-link" onClick={navigateToTerms}>
                            Terms of Service
                        </p>
                    </IonCol>
                </IonRow>

                <IonRow className="footer-bottom">
                    <IonCol size="12" className="text-center">
                        <IonText color="medium">
                            <p>&copy; {new Date().getFullYear()} RestieHardware. All rights reserved.</p>
                        </IonText>
                    </IonCol>
                </IonRow>
            </IonToolbar>
        </IonFooter>
    );
};

export default Footer;
