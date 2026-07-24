const argon2 = require('argon2');
async function test() {
    const hash = "$argon2id$v=19$m=65536,t=3,p=4$q6qZ9yRixw0Q8U5lS7fAag$XG3iH/03t2pXnQ75n1eYF9H0xXwI2FpHN1YJ4qB0t00";
    const pass = "NerdCTFAdminPass123!";
    try {
        const match = await argon2.verify(hash, pass);
        console.log("Match:", match);
    } catch(err) {
        console.log("Error:", err);
    }
}
test();
