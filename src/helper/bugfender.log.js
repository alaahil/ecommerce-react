import { Bugfender } from '@bugfender/rn-bugfender';
import { Platform } from 'react-native';

export const bugfenderLog = (obj: unknown, ...objs: unknown[]) => {
  if (Platform.OS === 'ios') {
    Bugfender.log(obj, ...objs);
  }
};

export const bugfenderError = (obj: unknown, ...objs: unknown[]) => {
  if (Platform.OS === 'ios') {
    Bugfender.error(obj, ...objs);
  }
};
