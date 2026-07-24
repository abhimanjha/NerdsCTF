function verifyKey() {
    const keyInput = document.getElementById('key').value;
    // Base64 encoded string of: nerdCTF{d1c0d1ng_is_n0t_encrypt10n}
    const authHash = "bmVyZENURntkMWMwZDFuZ19pc19uMHRfZW5jcnlwdDEwbn0=";
    
    if (btoa(keyInput) === authHash) {
        document.getElementById('msg').className = "message success";
        document.getElementById('msg').innerHTML = "Access Granted! The flag is indeed: " + keyInput;
    } else {
        document.getElementById('msg').className = "message error";
        document.getElementById('msg').innerHTML = "Invalid Master Bypass Key. Access Denied.";
    }
}
