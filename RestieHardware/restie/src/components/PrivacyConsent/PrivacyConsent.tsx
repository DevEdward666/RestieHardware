import React from 'react';
import { IonCheckbox, IonLabel, IonItem } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './PrivacyConsent.css';

interface PrivacyConsentProps {
    checked: boolean;
    onConsentChange: (checked: boolean) => void;
}

const PrivacyConsent: React.FC<PrivacyConsentProps> = ({ checked, onConsentChange }) => {
    const history = useHistory();

    const navigateToPrivacy = (e: React.MouseEvent) => {
        e.preventDefault();
        history.push('/privacy');
    };

    return (
        <IonItem lines="none" className="privacy-consent-item">
            <IonCheckbox
                slot="start"
                checked={checked}
                onIonChange={(e) => onConsentChange(e.detail.checked)}
                className="privacy-checkbox"
            />
            <IonLabel className="privacy-label">
                I agree to the{' '}
                <span className="privacy-link" onClick={navigateToPrivacy}>
                    Privacy Policy
                </span>{' '}
                and consent to the collection and use of my personal information as described.
            </IonLabel>
        </IonItem>
    );
};

export default PrivacyConsent;
