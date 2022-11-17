import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Platform,
} from 'react-native';
import Email from 'react-native-vector-icons/Zocial';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FaIcon from 'react-native-vector-icons/FontAwesome5';
import { BASE_URL } from '../../constant/constant';

const ContactUs = () => {
  const whatsappUrl = 'whatsapp://send?text=hello&phone=+971502777304';
  const facebookUrl = 'https://www.facebook.com/bidfoodhomeuae/';
  const instagramUrl = 'https://www.instagram.com/bidfoodhomeuae/';
  const linkedinUrl = 'https://ae.linkedin.com/company/bidfood-home';
  const privacyUrl = BASE_URL + '/s44/our-privacy-policy';
  const terms_Conditions_Url = BASE_URL + '/s44/term-conditions';
  const email_Url = 'mailto:bidfoodhomeuae@bidfoodme.com';

  const initiateWhatsAppChat = () => {
    Linking.openURL(whatsappUrl).catch((error) => {
      alert('Please install WhatsApp');
    });
  };

  const initiatePhoneCall = () => {
    let phoneNumber = '';
    if (Platform.OS === 'android') {
      phoneNumber = 'tel:${+97150 277 7304}';
    } else {
      phoneNumber = 'telprompt:${+97150 277 7304}';
    }
    Linking.openURL(phoneNumber);
  };

  const initiateFacebookChat = () => {
    Linking.openURL(facebookUrl).catch(() => {
      alert('Please check your internet connection');
    });
  };

  const initiateInstagramChat = () => {
    Linking.openURL(instagramUrl).catch(() => {
      alert('Please check your internet connection');
    });
  };

  const initiateLinkedinChat = () => {
    Linking.openURL(linkedinUrl).catch(() => {
      alert('Please check your internet connection');
    });
  };

  const browsePrivacyPolicy = () => {
    Linking.openURL(privacyUrl).catch(() => {
      alert('Please check your internet connection');
    });
  };

  const browseTermsAndConditions = () => {
    Linking.openURL(terms_Conditions_Url).catch(() => {
      alert('Please check your internet connection');
    });
  };

  const openEmail = () => {
    Linking.openURL(email_Url).catch(() => {
      alert('Please intall email app');
    });
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={{
        backgroundColor: '#fff',
        flex: 1,
      }}
    >
      <TouchableOpacity style={styles.container} onPress={openEmail}>
        <Email
          name="email"
          size={25}
          color="#8BC63E"
          style={styles.iconStyle}
        />
        <Text style={styles.textStyle}>Email Customer Service</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.container} onPress={initiateWhatsAppChat}>
        <FaIcon
          name="whatsapp-square"
          size={25}
          color="#8BC63E"
          style={styles.iconStyle}
        />
        <Text style={[styles.textStyle, { marginLeft: 5 }]}>Whatsapp</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.container} onPress={initiatePhoneCall}>
        <Icon name="phone" size={25} color="#8BC63E" style={styles.iconStyle} />
        <Text style={styles.textStyle}>Call Customer Service</Text>
      </TouchableOpacity>
      {/*<TouchableOpacity style={styles.container} onPress={initiateFacebookChat}>
        <Icon
          name="facebook"
          size={25}
          color="#8BC63E"
          style={styles.iconStyle}
        />
        <Text style={styles.textStyle}>Facebook</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.container}
        onPress={initiateInstagramChat}>
        <Icon
          name="instagram"
          size={25}
          color="#fff"
          style={[
            styles.iconStyle,
            {
              backgroundColor: '#8BC63E',
              borderColor: '#8BC63E',
            },
          ]}
        />
        <Text style={styles.textStyle}>Instagram</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.container} onPress={initiateLinkedinChat}>
        <Icon
          name="linkedin"
          size={25}
          color="#8BC63E"
          style={styles.iconStyle}
        />
        <Text style={styles.textStyle}>Linkedin</Text>
      </TouchableOpacity>*/}
      <TouchableOpacity style={styles.container} onPress={browsePrivacyPolicy}>
        <FaIcon
          name="book"
          size={25}
          color="#8BC63E"
          style={styles.iconStyle}
        />
        <Text style={styles.textStyle}>Privacy Policy</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.container}
        onPress={browseTermsAndConditions}
      >
        <FaIcon name="tag" size={25} color="#8BC63E" style={styles.iconStyle} />
        <Text style={styles.textStyle}>{'Terms & Conditions'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginTop: 24,
    paddingLeft: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#E1E1E1',
    alignItems: 'center',
  },
  textStyle: {
    color: '#8BC63E',
    fontSize: 18,
    alignSelf: 'center',
  },
  iconStyle: {
    marginRight: 18,
    alignSelf: 'center',
  },
});

export default ContactUs;
