# Administrator Solution Walkthrough: Lab 3 - Hidden Header

## 1. Challenge Details
- **Name**: Hidden Header
- **Difficulty**: Medium
- **Points**: 200
- **Category**: Web Exploitation
- **Tags**: `headers,http,methods`
- **Flag**: `nerdCTF{h1dd3n_h34d3r_HTTP_m3th0ds}`
- **Estimated Time**: 20 Minutes

---

## 2. Learning Objectives
- Learn about HTTP verbs and request structures.
- Understand how web applications process custom request headers and request methods (like HEAD).
- Gain proficiency in crafting command-line requests using `curl`.

---

## 3. Setup & Target Environment
- Spuns up as an Express server on Port `8003`.
- Rejects standard GET/POST methods unless the custom header is present, returning `405 Method Not Allowed`.

---

## 4. Expected Solution

### Method A: Inspecting HTTP Headers
1. Launch the lab target by navigating to `http://localhost:8003`.
2. Notice the error response stating that only the core system is allowed, along with a clue to check the `HEAD` method.
3. Open a terminal and run `curl` to request headers only:
   ```bash
   curl -I http://localhost:8003
   ```
4. Examine the server headers returned. You will see:
   ```http
   HTTP/1.1 200 OK
   X-Flag: nerdCTF{h1dd3n_h34d3r_HTTP_m3th0ds}
   X-Hint: Try setting request header X-Request-Source: nerdCTF_Core to see it in the body!
   ```
5. Extract the flag from the `X-Flag` header.

### Method B: Setting Custom Request Headers
1. As suggested in the `X-Hint` header, configure the custom header `X-Request-Source: nerdCTF_Core`.
2. Run `curl` with custom headers:
   ```bash
   curl -H "X-Request-Source: nerdCTF_Core" http://localhost:8003
   ```
3. The server validates the request header and prints:
   ```json
   {
       "success": true,
       "message": "Welcome, Core System. Authentication successful.",
       "flag": "nerdCTF{h1dd3n_h34d3r_HTTP_m3th0ds}"
     }
   ```

---

## 5. Common Mistakes
- **Using a standard web browser**: Modern browsers do not easily allow setting custom request headers or changing request methods to `HEAD` without browser extensions or using developer tools console scripts. Using command line tools like `curl`, `wget`, or APIs clients like Postman is the intended approach.
- **Header formatting errors**: Typo in header name (e.g. `X-Request-source` instead of exact camelcase `X-Request-Source`).

---

## 6. Code Explanation
The backend verification checks:
```javascript
if (req.method === 'HEAD') {
    res.setHeader('X-Flag', 'nerdCTF{h1dd3n_h34d3r_HTTP_m3th0ds}');
    return res.status(200).end();
}
```
HEAD requests are structurally identical to GET requests, but the server does not return the response body. Therefore, the flag is returned in the response headers.
