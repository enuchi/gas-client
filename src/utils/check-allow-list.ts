import { AllowedDevelopmentDomains } from '../types/config';

/**
 * Util that returns true if allowedDevelopmentDomains matches origin
 * @param {string|function} allowedDevelopmentDomains either a string of space-separated allowed subdomains or a function that accepts the origin as an argument and returns true if permitted
 * @param {string} origin the target origin subdomain to compare against
 */
export default (eventOrigin: string, allowedDevelopmentDomains?: AllowedDevelopmentDomains): boolean => {
  if (typeof allowedDevelopmentDomains === 'string') {
    return allowedDevelopmentDomains.split(' ').some((permittedOrigin) => permittedOrigin === eventOrigin);
  }

  if (typeof allowedDevelopmentDomains === 'function') {
    return allowedDevelopmentDomains(eventOrigin) === true;
  }

  return false;
};
