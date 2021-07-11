import { AllowedDevelopmentDomains } from '../types/config';

const checkAllowList = (eventOrigin: string, allowedDevelopmentDomains?: AllowedDevelopmentDomains): boolean => {
  if (typeof allowedDevelopmentDomains === 'string') {
    return allowedDevelopmentDomains.split(' ').some((permittedOrigin) => permittedOrigin === eventOrigin);
  }

  if (typeof allowedDevelopmentDomains === 'function') {
    return allowedDevelopmentDomains(eventOrigin) === true;
  }

  return false;
};

export { checkAllowList };
