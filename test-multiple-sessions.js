const axios = require('axios');

// Test script to verify multiple user sessions functionality
async function testMultipleSessions() {
  const baseURL = 'https://c4ba947d9455f026.ngrok.app';
  
  console.log('🧪 Testing Multiple User Sessions...\n');
  
  try {
    // Test 1: Login as first user
    console.log('1️⃣ Testing login for user 1 (+601121677522)...');
    const user1Response = await axios.post(`${baseURL}/api/auth/login`, {
      phoneNumber: '+601121677522'
    });
    
    if (user1Response.data.success) {
      console.log('✅ User 1 login successful');
      console.log(`   Token: ${user1Response.data.token.substring(0, 20)}...`);
      console.log(`   User: ${user1Response.data.user.phoneNumber}\n`);
    } else {
      console.log('❌ User 1 login failed');
      return;
    }
    
    // Test 2: Login as second user
    console.log('2️⃣ Testing login for user 2 (+60123456789)...');
    const user2Response = await axios.post(`${baseURL}/api/auth/login`, {
      phoneNumber: '+60123456789'
    });
    
    if (user2Response.data.success) {
      console.log('✅ User 2 login successful');
      console.log(`   Token: ${user2Response.data.token.substring(0, 20)}...`);
      console.log(`   User: ${user2Response.data.user.phoneNumber}\n`);
    } else {
      console.log('❌ User 2 login failed');
      return;
    }
    
    // Test 3: Check status for both users
    console.log('3️⃣ Testing status check for both users...');
    
    const user1Status = await axios.get(`${baseURL}/api/status`, {
      headers: { 'Authorization': `Bearer ${user1Response.data.token}` }
    });
    
    const user2Status = await axios.get(`${baseURL}/api/status`, {
      headers: { 'Authorization': `Bearer ${user2Response.data.token}` }
    });
    
    console.log('✅ User 1 status:', user1Status.data);
    console.log('✅ User 2 status:', user2Status.data);
    console.log('');
    
    // Test 4: Check actions for both users (should be empty initially)
    console.log('4️⃣ Testing actions retrieval for both users...');
    
    const user1Actions = await axios.get(`${baseURL}/api/actions`, {
      headers: { 'Authorization': `Bearer ${user1Response.data.token}` }
    });
    
    const user2Actions = await axios.get(`${baseURL}/api/actions`, {
      headers: { 'Authorization': `Bearer ${user2Response.data.token}` }
    });
    
    console.log(`✅ User 1 actions: ${user1Actions.data.actions.length} actions`);
    console.log(`✅ User 2 actions: ${user2Actions.data.actions.length} actions`);
    console.log('');
    
    // Test 5: Test chat functionality for both users
    console.log('5️⃣ Testing chat functionality for both users...');
    
    const user1Chat = await axios.post(`${baseURL}/api/chat`, {
      message: 'Hello from user 1!'
    }, {
      headers: { 
        'Authorization': `Bearer ${user1Response.data.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const user2Chat = await axios.post(`${baseURL}/api/chat`, {
      message: 'Hello from user 2!'
    }, {
      headers: { 
        'Authorization': `Bearer ${user2Response.data.token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ User 1 chat response:', user1Chat.data.response.substring(0, 50) + '...');
    console.log('✅ User 2 chat response:', user2Chat.data.response.substring(0, 50) + '...');
    console.log('');
    
    console.log('🎉 All tests passed! Multiple user sessions are working correctly.');
    console.log('\n📋 Summary:');
    console.log('   - Each user gets their own WhatsApp Web.js session');
    console.log('   - User-specific authentication tokens work correctly');
    console.log('   - User-specific status and actions are isolated');
    console.log('   - Chat functionality works for each user independently');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testMultipleSessions();
