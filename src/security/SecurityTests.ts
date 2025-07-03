/**
 * 🔒 Security Tests
 * Demonstrates and validates security features
 * Run these tests to verify security implementation
 */

import { 
  sanitizeInput, 
  sanitizeCSSValue, 
  secureAddGold, 
  secureSpendGold,
  validatePackagePurchase,
  validateStateChange,
  secureLocalStorage,
  getSecurityStatus
} from './SecurityEnhancements';

// Test Results Interface
interface TestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: unknown;
}

// Security Test Suite
export class SecurityTests {
  private results: TestResult[] = [];

  /**
   * Run all security tests
   */
  public runAllTests(): TestResult[] {
    console.log('🔒 Running Security Tests...');
    
    this.testInputSanitization();
    this.testCSSSanitization();
    this.testGoldOperations();
    this.testPackageValidation();
    this.testStateValidation();
    this.testLocalStorageSecurity();
    this.testSecurityMonitoring();

    this.printResults();
    return this.results;
  }

  /**
   * Test input sanitization
   */
  private testInputSanitization(): void {
    const testCases = [
      {
        input: '<script>alert("xss")</script>',
        expected: 'alert("xss")',
        name: 'XSS Script Tag Removal'
      },
      {
        input: 'javascript:alert("xss")',
        expected: 'alert("xss")',
        name: 'JavaScript Protocol Removal'
      },
      {
        input: 'onclick=alert("xss")',
        expected: 'alert("xss")',
        name: 'Event Handler Removal'
      },
      {
        input: 'data:text/html,<script>alert("xss")</script>',
        expected: 'text/html,alert("xss")',
        name: 'Data URL Removal'
      }
    ];

    testCases.forEach(testCase => {
      const sanitized = sanitizeInput(testCase.input);
      const passed = sanitized === testCase.expected;
      
      this.results.push({
        testName: `Input Sanitization: ${testCase.name}`,
        passed,
        message: passed ? 'Input properly sanitized' : 'Input sanitization failed',
        details: { input: testCase.input, expected: testCase.expected, actual: sanitized }
      });
    });
  }

  /**
   * Test CSS value sanitization
   */
  private testCSSSanitization(): void {
    const testCases = [
      {
        input: '#FFD700',
        expected: '#FFD700',
        name: 'Valid CSS Color'
      },
      {
        input: 'red; } body { display: none; } .hack {',
        expected: '',
        name: 'CSS Injection Prevention'
      },
      {
        input: 'url(http://evil.com/steal)',
        expected: '',
        name: 'External URL Prevention'
      }
    ];

    testCases.forEach(testCase => {
      const sanitized = sanitizeCSSValue(testCase.input);
      const passed = sanitized === testCase.expected;
      
      this.results.push({
        testName: `CSS Sanitization: ${testCase.name}`,
        passed,
        message: passed ? 'CSS value properly sanitized' : 'CSS sanitization failed',
        details: { input: testCase.input, expected: testCase.expected, actual: sanitized }
      });
    });
  }

  /**
   * Test gold operations
   */
  private testGoldOperations(): void {
    // Test valid gold operations
    const validGold = secureAddGold(100);
    this.results.push({
      testName: 'Gold Operations: Valid Amount',
      passed: validGold,
      message: validGold ? 'Valid gold amount accepted' : 'Valid gold amount rejected'
    });

    // Test invalid gold operations
    const invalidGold = secureAddGold(999999);
    this.results.push({
      testName: 'Gold Operations: Invalid Amount',
      passed: !invalidGold,
      message: !invalidGold ? 'Invalid gold amount properly rejected' : 'Invalid gold amount accepted'
    });

    // Test spending validation
    const validSpend = secureSpendGold(50);
    this.results.push({
      testName: 'Gold Spending: Valid Amount',
      passed: validSpend,
      message: validSpend ? 'Valid spending amount accepted' : 'Valid spending amount rejected'
    });

    const invalidSpend = secureSpendGold(99999);
    this.results.push({
      testName: 'Gold Spending: Invalid Amount',
      passed: !invalidSpend,
      message: !invalidSpend ? 'Invalid spending amount properly rejected' : 'Invalid spending amount accepted'
    });
  }

  /**
   * Test package validation
   */
  private testPackageValidation(): void {
    // Test valid package
    const validPackage = validatePackagePurchase('test_package', 100, 5);
    this.results.push({
      testName: 'Package Validation: Valid Package',
      passed: validPackage.valid,
      message: validPackage.valid ? 'Valid package accepted' : 'Valid package rejected'
    });

    // Test invalid package ID
    const invalidPackageId = validatePackagePurchase('<script>alert("xss")</script>', 100, 5);
    this.results.push({
      testName: 'Package Validation: Invalid Package ID',
      passed: !invalidPackageId.valid,
      message: !invalidPackageId.valid ? 'Invalid package ID properly rejected' : 'Invalid package ID accepted'
    });

    // Test invalid cost
    const invalidCost = validatePackagePurchase('test_package', 99999, 5);
    this.results.push({
      testName: 'Package Validation: Invalid Cost',
      passed: !invalidCost.valid,
      message: !invalidCost.valid ? 'Invalid cost properly rejected' : 'Invalid cost accepted'
    });
  }

  /**
   * Test state validation
   */
  private testStateValidation(): void {
    const oldState = { gold: 100, energy: 50 };
    const newState = { gold: 999999, energy: 50 };

    const validation = validateStateChange('addGold', oldState, newState);
    this.results.push({
      testName: 'State Validation: Unrealistic Gold Increase',
      passed: !validation.valid,
      message: !validation.valid ? 'Unrealistic state change properly rejected' : 'Unrealistic state change accepted'
    });
  }

  /**
   * Test localStorage security
   */
  private testLocalStorageSecurity(): void {
    // Test valid storage
    const validSet = secureLocalStorage.setItem('test_key', 'test_value');
    this.results.push({
      testName: 'LocalStorage: Valid Storage',
      passed: validSet,
      message: validSet ? 'Valid data stored successfully' : 'Valid data storage failed'
    });

    // Test malicious data
    const maliciousSet = secureLocalStorage.setItem('test_key', '<script>alert("xss")</script>');
    this.results.push({
      testName: 'LocalStorage: Malicious Data Prevention',
      passed: !maliciousSet,
      message: !maliciousSet ? 'Malicious data properly rejected' : 'Malicious data accepted'
    });

    // Test retrieval
    const retrieved = secureLocalStorage.getItem('test_key');
    this.results.push({
      testName: 'LocalStorage: Secure Retrieval',
      passed: retrieved === 'test_value',
      message: retrieved === 'test_value' ? 'Data retrieved successfully' : 'Data retrieval failed'
    });
  }

  /**
   * Test security monitoring
   */
  private testSecurityMonitoring(): void {
    const stats = getSecurityStatus();
    
    this.results.push({
      testName: 'Security Monitoring: Status Retrieval',
      passed: typeof stats === 'object' && stats !== null,
      message: typeof stats === 'object' && stats !== null ? 'Security status retrieved successfully' : 'Security status retrieval failed',
      details: stats
    });

    this.results.push({
      testName: 'Security Monitoring: Required Fields',
      passed: 'totalEvents' in stats && 'suspiciousActivityCount' in stats && 'isLocked' in stats,
      message: 'totalEvents' in stats && 'suspiciousActivityCount' in stats && 'isLocked' in stats 
        ? 'All required security fields present' : 'Missing required security fields'
    });
  }

  /**
   * Print test results
   */
  private printResults(): void {
    console.log('\n🔒 Security Test Results:');
    console.log('========================');
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    
    this.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${result.testName}: ${result.message}`);
      
      if (result.details && !result.passed) {
        console.log(`   Details:`, result.details);
      }
    });
    
    console.log(`\n📊 Summary: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All security tests passed!');
    } else {
      console.log('⚠️ Some security tests failed. Review the details above.');
    }
  }

  /**
   * Test security features manually
   */
  public static runManualTests(): void {
    console.log('🔒 Manual Security Tests');
    console.log('========================');
    
    // Test 1: Try to manipulate store state
    console.log('\n1. Testing store state manipulation prevention...');
    console.log('   Try running this in browser console:');
    console.log('   window.gameStore.setState({ gold: 999999 })');
    console.log('   Expected: Security warning in console');
    
    // Test 2: Test rate limiting
    console.log('\n2. Testing rate limiting...');
    console.log('   Try clicking upgrade buttons rapidly');
    console.log('   Expected: Actions blocked after rate limit exceeded');
    
    // Test 3: Test input sanitization
    console.log('\n3. Testing input sanitization...');
    const testInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeInput(testInput);
    console.log(`   Input: ${testInput}`);
    console.log(`   Sanitized: ${sanitized}`);
    console.log(`   Result: ${sanitized.includes('<script>') ? '❌ FAIL' : '✅ PASS'}`);
    
    // Test 4: Test security monitoring
    console.log('\n4. Testing security monitoring...');
    const stats = getSecurityStatus();
    console.log('   Security Stats:', stats);
    
    // Test 5: Test store method security
    console.log('\n5. Testing store method security...');
    console.log('   Try calling these methods with invalid values:');
    console.log('   - store.addGold(999999)');
    console.log('   - store.spendGold(-100)');
    console.log('   - store.setGold(999999)');
    console.log('   Expected: All should be blocked by security');
    
    // Test 6: Test package purchase security
    console.log('\n6. Testing package purchase security...');
    console.log('   Try purchasing packages with invalid data:');
    console.log('   - Invalid package ID');
    console.log('   - Invalid cost values');
    console.log('   Expected: Invalid purchases should be blocked');
    
    // Test 7: Test CSS injection prevention
    console.log('\n7. Testing CSS injection prevention...');
    const maliciousCSS = 'red; } body { display: none; } .hack {';
    const sanitizedCSS = sanitizeCSSValue(maliciousCSS);
    console.log(`   Malicious CSS: ${maliciousCSS}`);
    console.log(`   Sanitized CSS: ${sanitizedCSS}`);
    console.log(`   Result: ${sanitizedCSS === '' ? '✅ PASS' : '❌ FAIL'}`);
  }
}

// Export test instance
export const securityTests = new SecurityTests();

// Auto-run tests in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  // Run tests after a delay to ensure everything is loaded
  setTimeout(() => {
    securityTests.runAllTests();
    SecurityTests.runManualTests();
  }, 2000);
} 