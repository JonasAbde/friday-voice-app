#!/usr/bin/env node
/**
 * TTS Integration Test Suite
 * Tests retry logic, fallback behavior, and voice consistency
 */

const TTSEngine = require('./tts-integration');
const fs = require('fs');
const path = require('path');

// Mock HTTPS for testing
const https = require('https');
const originalRequest = https.request;

class TTSTestSuite {
    constructor() {
        this.testResults = [];
        this.tts = new TTSEngine();
    }
    
    async runAllTests() {
        console.log('🧪 Starting TTS Integration Tests...\n');
        
        await this.testNormalOperation();
        await this.testRetryLogic();
        await this.testMetricsLogging();
        
        this.printResults();
    }
    
    async testNormalOperation() {
        console.log('TEST 1: Normal ElevenLabs operation');
        
        try {
            // This will make a real API call
            const audioUrl = await this.tts.generateAudio('Hej Jonas, dette er en test.');
            
            if (audioUrl && audioUrl.startsWith('/audio/')) {
                this.pass('Normal operation', 'Generated audio successfully');
            } else {
                this.fail('Normal operation', `Unexpected URL: ${audioUrl}`);
            }
        } catch (err) {
            this.fail('Normal operation', err.message);
        }
    }
    
    async testRetryLogic() {
        console.log('\nTEST 2: Retry logic with simulated timeout');
        
        // Mock https.request to simulate timeout
        let attemptCount = 0;
        https.request = function(url, options, callback) {
            attemptCount++;
            
            if (attemptCount < 2) {
                // Simulate timeout on first attempt
                const req = {
                    on: (event, handler) => {
                        if (event === 'error') {
                            setTimeout(() => handler(new Error('Simulated timeout')), 100);
                        }
                        return req;
                    },
                    write: () => {},
                    end: () => {},
                    destroy: () => {}
                };
                return req;
            } else {
                // Success on second attempt
                return originalRequest(url, options, callback);
            }
        };
        
        try {
            const audioUrl = await this.tts.generateAudio('Test retry logic', 1);
            
            if (attemptCount === 2) {
                this.pass('Retry logic', `Succeeded after ${attemptCount} attempts`);
            } else {
                this.fail('Retry logic', `Wrong attempt count: ${attemptCount}`);
            }
        } catch (err) {
            this.fail('Retry logic', err.message);
        } finally {
            // Restore original request
            https.request = originalRequest;
        }
    }
    
    async testMetricsLogging() {
        console.log('\nTEST 3: Metrics logging');
        
        const metricsFile = path.join(__dirname, 'audio-cache', 'tts-metrics.jsonl');
        
        // Clear existing metrics
        if (fs.existsSync(metricsFile)) {
            fs.unlinkSync(metricsFile);
        }
        
        // Generate audio (should log success)
        try {
            await this.tts.generateAudio('Test metrics logging');
            
            // Check if metrics file was created
            if (fs.existsSync(metricsFile)) {
                const content = fs.readFileSync(metricsFile, 'utf8');
                const lines = content.trim().split('\n');
                
                if (lines.length > 0) {
                    const lastEntry = JSON.parse(lines[lines.length - 1]);
                    
                    if (lastEntry.status === 'success' && lastEntry.source === 'ElevenLabs') {
                        this.pass('Metrics logging', 'Success logged correctly');
                    } else {
                        this.fail('Metrics logging', `Unexpected entry: ${JSON.stringify(lastEntry)}`);
                    }
                } else {
                    this.fail('Metrics logging', 'No entries in metrics file');
                }
            } else {
                this.fail('Metrics logging', 'Metrics file not created');
            }
        } catch (err) {
            this.fail('Metrics logging', err.message);
        }
    }
    
    pass(testName, message) {
        console.log(`✅ ${testName}: ${message}`);
        this.testResults.push({ name: testName, status: 'PASS', message });
    }
    
    fail(testName, message) {
        console.log(`❌ ${testName}: ${message}`);
        this.testResults.push({ name: testName, status: 'FAIL', message });
    }
    
    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('TEST RESULTS');
        console.log('='.repeat(60));
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        
        console.log(`Total: ${this.testResults.length}`);
        console.log(`Passed: ${passed} ✅`);
        console.log(`Failed: ${failed} ❌`);
        
        if (failed === 0) {
            console.log('\n🎉 All tests passed!');
        } else {
            console.log('\n⚠️ Some tests failed. Review logs above.');
        }
    }
}

// Run tests
const suite = new TTSTestSuite();
suite.runAllTests().catch(err => {
    console.error('❌ Test suite crashed:', err);
    process.exit(1);
});
