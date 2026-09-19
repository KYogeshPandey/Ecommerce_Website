const { spawn } = require('child_process');

function runTest(env) {
    return new Promise((resolve) => {
        const proc = spawn(process.execPath, ['-e', 'require("./config/db")()'], {
            env: { ...process.env, ...env }
        });
        let stdout = '';
        let stderr = '';
        proc.stdout.on('data', d => stdout += d.toString());
        proc.stderr.on('data', d => stderr += d.toString());
        proc.on('close', code => {
            resolve({ code, stdout, stderr });
        });
    });
}

async function all() {
    console.log("Testing config/db.js environment configurations...");

    // Test 1: Production without MONGO_URI
    const r1 = await runTest({ NODE_ENV: 'production', MONGO_URI: '' });
    console.log('Test 1 - Prod without MONGO_URI exits with 1:', r1.code === 1);
    console.log('Test 1 - Stderr has FATAL message:', r1.stderr.includes('FATAL'));

    // Test 2: Production with invalid MONGO_URI
    const r2 = await runTest({ NODE_ENV: 'production', MONGO_URI: 'mongodb://invalid-host:27017/prod' });
    console.log('Test 2 - Prod with failing URI exits with 1:', r2.code === 1);
    console.log('Test 2 - Stderr has refusing fallback message:', r2.stderr.includes('refusing fallback'));

    // Test 3: Development without MONGO_URI and no local Mongo
    const r3 = await runTest({ NODE_ENV: 'development', MONGO_URI: '' });
    console.log('Test 3 - Dev exits with 0 (survives offline):', r3.code === 0);
    console.log('Test 3 - Output mentions demo fallback:', (r3.stdout + r3.stderr).includes('offline/demo fallback mode'));
}

all().then(() => console.log('DB CONFIG TESTS COMPLETED')).catch(console.error);
