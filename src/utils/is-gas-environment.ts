export default (): boolean => typeof google !== 'undefined' && Boolean(google?.script?.run);
