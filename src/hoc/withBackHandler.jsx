import React from 'react';
import BackHandlerWrapper from '../components/BackHandlerWrapper';

/**
 * Higher-Order Component for adding back button handling to screens
 * 
 * @param {React.Component} WrappedComponent - The component to wrap
 * @param {Object} options - Options for the back handler
 * @param {string} options.routeName - The route name to navigate back to (default: 'TabNavigation')
 * @param {string} options.screen - The specific screen in the Tab Navigator to navigate to
 * @returns {React.Component} - The wrapped component with back handling
 */
const withBackHandler = (WrappedComponent, options = {}) => {
  const { routeName = 'TabNavigation', screen } = options;
  
  const WithBackHandler = (props) => {
    return (
      <BackHandlerWrapper routeName={routeName} screen={screen}>
        <WrappedComponent {...props} />
      </BackHandlerWrapper>
    );
  };
  
  // Set display name for debugging
  WithBackHandler.displayName = `withBackHandler(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return WithBackHandler;
};

export default withBackHandler; 