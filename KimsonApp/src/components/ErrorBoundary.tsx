import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';


interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('=== ERROR BOUNDARY CAUGHT ERROR ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error type:', typeof error);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error('====================================');
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      const errorInfo = this.state.errorInfo;
      
      console.error('=== ERROR BOUNDARY RENDER ERROR ===');
      console.error('Error:', error);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      console.error('Error name:', error?.name);
      console.error('Component Stack:', errorInfo?.componentStack);
      console.error('===================================');
      
      return (
        <View 
          style={styles.container}
          collapsable={false}
          removeClippedSubviews={false}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            nestedScrollEnabled={false}
            removeClippedSubviews={false}
          >
            <Text 
              style={styles.title}
              allowFontScaling={false}
              selectable={false}
            >
              Something went wrong
            </Text>
            <Text 
              style={styles.message}
              allowFontScaling={false}
              selectable={false}
            >
              {error?.toString() || 'Unknown error occurred'}
            </Text>
            {__DEV__ && error && (
              <>
                <Text 
                  style={[styles.stack, { marginTop: 10 }]}
                  allowFontScaling={false}
                  selectable={false}
                >
                  Error: {error.message}
                </Text>
                <Text 
                  style={[styles.stack, { marginTop: 10 }]}
                  allowFontScaling={false}
                  selectable={false}
                >
                  {error.stack}
                </Text>
                {errorInfo && (
                  <Text 
                    style={[styles.stack, { marginTop: 10 }]}
                    allowFontScaling={false}
                    selectable={false}
                  >
                    Component Stack:{'\n'}{errorInfo.componentStack}
                  </Text>
                )}
              </>
            )}
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  stack: {
    fontSize: 12,
    color: '#888',
    marginTop: 20,
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;





