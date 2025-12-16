# Privacy Policy Integration Guide

This guide shows how to integrate the Privacy Policy components into your RestieHardware app.

## ✅ What's Been Created

### 1. Privacy Policy Page
- **Location**: `/src/pages/PrivacyPolicy/PrivacyPolicyPage.tsx`
- **Route**: `/privacy`
- **Features**: Full privacy policy with Meta compliance, styled and mobile-responsive

### 2. Footer Component
- **Location**: `/src/components/Footer/Footer.tsx`
- **Usage**: Add to any page to show footer with privacy policy link

### 3. Privacy Consent Checkbox
- **Location**: `/src/components/PrivacyConsent/PrivacyConsent.tsx`
- **Usage**: Add to registration/signup forms

## 📝 How to Use

### Add Footer to a Page

```tsx
import Footer from '../../components/Footer/Footer';

const YourPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        {/* Your header */}
      </IonHeader>
      
      <IonContent>
        {/* Your content */}
      </IonContent>
      
      <Footer />
    </IonPage>
  );
};
```

### Add Privacy Consent to Registration Form

Example for `LoginComponent.tsx` or any registration form:

```tsx
import PrivacyConsent from '../PrivacyConsent/PrivacyConsent';
import { useState } from 'react';

const YourRegistrationComponent = () => {
  const [privacyConsent, setPrivacyConsent] = useState(false);
  
  const handleRegister = async () => {
    // Validate consent before registration
    if (!privacyConsent) {
      alert('Please accept the Privacy Policy to continue');
      return;
    }
    
    // Your registration logic here
    const payload = {
      ...customerInformation,
      privacyConsent: privacyConsent, // Include in API call
    };
    
    await dispatch(RegisterUser(payload));
  };
  
  return (
    <IonCard>
      {/* Other form fields */}
      
      <PrivacyConsent
        checked={privacyConsent}
        onConsentChange={setPrivacyConsent}
      />
      
      <IonButton 
        onClick={handleRegister}
        disabled={!privacyConsent}
      >
        Register
      </IonButton>
    </IonCard>
  );
};
```

### Add Footer to MainTab

Update `MainTab.tsx`:

```tsx
import Footer from '../../components/Footer/Footer';

const MainTab: React.FC = () => {
  return (
    <IonPage>
      <IonTabs>
        {/* Your tabs */}
      </IonTabs>
      
      <Footer />
    </IonPage>
  );
};
```

## 🔗 URL Structure

Once deployed, your privacy policy will be accessible at:
- **Local**: `http://localhost:8100/privacy`
- **Production**: `https://yourdomain.com/privacy`

## 📱 Testing

1. Start your development server:
   ```bash
   cd RestieHardware/restie
   npm start
   ```

2. Navigate to: `http://localhost:8100/privacy`

3. Test mobile responsiveness using browser dev tools

## 🌐 For Meta/Facebook Integration

### Step 1: Deploy Your App
Make sure your app is deployed and accessible via HTTPS.

### Step 2: Get Your Privacy Policy URL
Example: `https://restiehardware.com/privacy`

### Step 3: Update Facebook Business Settings
1. Go to: https://business.facebook.com/settings
2. Select your App
3. Navigate to "App Settings" → "Basic"
4. Add your Privacy Policy URL: `https://yourdomain.com/privacy`
5. Save changes

### Step 4: Messenger Platform Review
When submitting for Messenger API review, provide:
- Privacy Policy URL
- Screenshots showing consent checkbox
- Description of how you handle user data

## 🎨 Customization

### Change Colors
Edit `PrivacyPolicyPage.css`:

```css
.privacy-policy-container h2 {
  color: #your-brand-color;
  border-bottom: 2px solid #your-brand-color;
}
```

### Update Footer Colors
Edit `Footer.css`:

```css
.app-footer {
  --background: #your-color;
}
```

## ✅ Next Steps

1. ✅ Privacy Policy page created
2. ✅ Routing added (`/privacy`)
3. ✅ Footer component created
4. ✅ Consent checkbox component created
5. 🔲 Add Footer to your main pages
6. 🔲 Add consent checkbox to registration/signup
7. 🔲 Update API to store consent status
8. 🔲 Deploy app to production
9. 🔲 Update Facebook Business Settings with privacy URL
10. 🔲 Submit for Messenger API review

## 📄 API Integration

You may want to update your `PostCustomerInfo` model to include consent:

```csharp
// In CustomerRequestModel.cs
public class PostCustomerInfo
{
    // ... existing fields
    public bool PrivacyConsent { get; set; }
    public DateTime ConsentDate { get; set; }
}
```

Store this in your database for compliance records.

## 🆘 Support

For issues or questions:
- Email: edwardjosephfernandez@gmail.com
- Phone: +63 920 840 0489
