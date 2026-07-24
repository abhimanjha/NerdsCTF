import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');

  // 1. Roles & Permissions
  const readPerm = await prisma.permission.upsert({
    where: { name: 'READ_LABS' },
    update: {},
    create: { name: 'READ_LABS', description: 'Can read challenges and details' },
  });

  const submitPerm = await prisma.permission.upsert({
    where: { name: 'SUBMIT_FLAGS' },
    update: {},
    create: { name: 'SUBMIT_FLAGS', description: 'Can submit flags for verification' },
  });

  const adminPerm = await prisma.permission.upsert({
    where: { name: 'MANAGE_SYSTEM' },
    update: {},
    create: { name: 'MANAGE_SYSTEM', description: 'Administrative rights over entire ecosystem' },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Super User with all rights',
      permissions: {
        connect: [{ id: readPerm.id }, { id: submitPerm.id }, { id: adminPerm.id }]
      }
    }
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: {
      name: 'USER',
      description: 'Standard CTF Player',
      permissions: {
        connect: [{ id: readPerm.id }, { id: submitPerm.id }]
      }
    }
  });

  // 2. Admin User
  // Password is 'NerdCTFAdminPass123!' -> Argon2 / simple hash for seed convenience
  // We'll store a standard argon2id hash. Below is generated from Argon2id for 'NerdCTFAdminPass123!'
  const adminPassHash = "$argon2id$v=19$m=65536,t=3,p=4$quSLbPyyGh9K1As6tXwYrQ$XXRfeMD2JiOjTEwYbT7OnOyYTZufVVaDoS+BCuRqOHU";
  
  await prisma.user.upsert({
    where: { email: 'admin@nerdctf.io' },
    update: { passwordHash: adminPassHash },
    create: {
      email: 'admin@nerdctf.io',
      username: 'nerd_admin',
      passwordHash: adminPassHash,
      isVerified: true,
      roleId: adminRole.id,
      country: 'US',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=nerd_admin'
    }
  });

  // 3. Categories
  const catWeb = await prisma.category.upsert({
    where: { name: 'Web Exploitation' },
    update: {},
    create: { name: 'Web Exploitation', description: 'Vulnerabilities targeting web servers and client engines.' }
  });

  const catCrypto = await prisma.category.upsert({
    where: { name: 'Cryptography' },
    update: {},
    create: { name: 'Cryptography', description: 'Deals with codes, encodings, ciphers, and algorithms.' }
  });

  // 4. Challenges & Flags & Hints
  // Lab 1
  const l1 = await prisma.challenge.create({
    data: {
      title: 'Cookie Monster',
      difficulty: 'Easy',
      description: 'Learn how cookies work and understand why client-side values should never be trusted.',
      objectives: 'Inspect cookies, modify the user role cookie value from guest to admin, and trigger the vault logic to uncover the flag.',
      categoryId: catWeb.id,
      points: 100,
      tags: 'cookies,web,basics',
      estimatedTime: 10,
      dockerImage: 'lab1-cookie-monster:latest',
      sourceCodeUrl: 'https://github.com/nerdCTF/labs/lab1',
      flags: {
        create: { flagHash: crypto.createHash('sha256').update('nerdCTF{c00k13_m0nst3r_m4n1pul4t10n}').digest('hex') }
      },
      hints: {
        create: [
          { content: 'Open developer tools (F12) in your browser and check the Application/Storage tab.', costPoints: 10 },
          { content: 'Change the value of cookie "role" to "admin" and refresh the webpage.', costPoints: 20 }
        ]
      }
    }
  });

  // Lab 2
  const l2 = await prisma.challenge.create({
    data: {
      title: 'Source Detective',
      difficulty: 'Easy',
      description: 'Inspect frontend resources to discover hidden clues and understand client-side information disclosure.',
      objectives: 'Examine source files including HTML elements, stylesheet files, and scripts to construct the secret key.',
      categoryId: catWeb.id,
      points: 100,
      tags: 'source,html,css,javascript',
      estimatedTime: 15,
      dockerImage: 'lab2-source-detective:latest',
      sourceCodeUrl: 'https://github.com/nerdCTF/labs/lab2',
      flags: {
        create: { flagHash: crypto.createHash('sha256').update('nerdCTF{s0urc3_d3t3ct1v3_f1nd_m3_cl0s3ly}').digest('hex') }
      },
      hints: {
        create: [
          { content: 'Right click on the page and select "View Page Source" to search for comments.', costPoints: 10 },
          { content: 'Look at style.css and app.js links. Open them directly in your browser or dev tools.', costPoints: 20 }
        ]
      }
    }
  });

  // Lab 3
  const l3 = await prisma.challenge.create({
    data: {
      title: 'Hidden Header',
      difficulty: 'Medium',
      description: 'Understand GET, POST, HEAD and how different request methods can expose sensitive information.',
      objectives: 'Interact with the server endpoint using curl or custom clients. Send request methods like HEAD or include special validation headers.',
      categoryId: catWeb.id,
      points: 200,
      tags: 'headers,http,methods',
      estimatedTime: 20,
      dockerImage: 'lab3-hidden-header:latest',
      sourceCodeUrl: 'https://github.com/nerdCTF/labs/lab3',
      flags: {
        create: { flagHash: crypto.createHash('sha256').update('nerdCTF{h1dd3n_h34d3r_HTTP_m3th0ds}').digest('hex') }
      },
      hints: {
        create: [
          { content: 'Try executing a HEAD request using curl: curl -I http://localhost:8003', costPoints: 15 },
          { content: 'The header output has a clue about sending X-Request-Source header.', costPoints: 30 }
        ]
      }
    }
  });

  // Lab 4
  const l4 = await prisma.challenge.create({
    data: {
      title: 'Encoded Secrets',
      difficulty: 'Medium',
      description: 'Discover encoded values inside a webpage and learn why encoding is not encryption.',
      objectives: 'Inspect client scripts, find encoded comparison blocks, decode the secret strings, and submit key.',
      categoryId: catCrypto.id,
      points: 200,
      tags: 'base64,encoding,crypto',
      estimatedTime: 15,
      dockerImage: 'lab4-encoded-secrets:latest',
      sourceCodeUrl: 'https://github.com/nerdCTF/labs/lab4',
      flags: {
        create: { flagHash: crypto.createHash('sha256').update('nerdCTF{d1c0d1ng_is_n0t_encrypt10n}').digest('hex') }
      },
      hints: {
        create: [
          { content: 'Analyze script.js to find the compared hash value: bmyyZENURntkMWMwZDFuZ19pc19uMHRfZW5jcnlwdDEwbn0=', costPoints: 15 },
          { content: 'Base64 strings end in padded symbols (=). Use an online tool or command line: echo "encoded_string" | base64 --decode', costPoints: 30 }
        ]
      }
    }
  });

  // Lab 5
  const l5 = await prisma.challenge.create({
    data: {
      title: 'Broken API',
      difficulty: 'Hard',
      description: 'Analyze an insecure API endpoint, understand improper authorization, and identify information disclosure.',
      objectives: 'Examine communication channels of the profile viewer. Determine query syntax, inspect response JSONs, and perform ID parameter tampering to view unauthorized data.',
      categoryId: catWeb.id,
      points: 300,
      tags: 'api,idor,authorization',
      estimatedTime: 25,
      dockerImage: 'lab5-broken-api:latest',
      sourceCodeUrl: 'https://github.com/nerdCTF/labs/lab5',
      flags: {
        create: { flagHash: crypto.createHash('sha256').update('nerdCTF{broken_api_IDOR_auth_bypass_99}').digest('hex') }
      },
      hints: {
        create: [
          { content: 'The client requests profile details from /api/profile?id=2. Inspect this request in developer tools network tab.', costPoints: 20 },
          { content: 'What happens if you fetch /api/profile?id=1 instead? You can modify the ID inside the input field.', costPoints: 40 }
        ]
      }
    }
  });

  // 5. Academy Content
  const topic1 = await prisma.academyTopic.create({
    data: {
      title: 'Introduction to Cybersecurity',
      description: 'Fundamental principles, security metrics, and getting started guide.',
      orderIndex: 1,
      lessons: {
        create: [
          {
            title: 'Welcome to nerdCTF',
            orderIndex: 1,
            contentMarkdown: '# Welcome to nerdCTF\n\nWelcome to your starting line in cybersecurity. A CTF (Capture The Flag) is an educational hacking competition designed to sharpen your analysis, coding, and defensive capabilities. In this course, you will learn to spot flaws and secure systems from the ground up.\n\n### The Core Pillars\n1. **Confidentiality**: Keeping data hidden from unauthorized eyes.\n2. **Integrity**: Ensuring data is not modified without permission.\n3. **Availability**: Guaranteeing resources are reachable when needed.'
          }
        ]
      }
    }
  });

  const topic2 = await prisma.academyTopic.create({
    data: {
      title: 'Web Fundamentals',
      description: 'Understand how browsers communicate with servers.',
      orderIndex: 2,
      lessons: {
        create: [
          {
            title: 'HTTP and Client Cookies',
            orderIndex: 1,
            contentMarkdown: '# HTTP Requests & Cookies\n\nHTTP (Hypertext Transfer Protocol) is a stateless protocol. To remember user sessions, servers assign **Cookies** back to the browser. The browser automatically appends these cookies to every subsequent request.\n\n### Security Notice\nBecause cookies are stored on the client machine, a user can modify them. Developers must use the `HttpOnly` flag to prevent JavaScript from reading cookies (mitigating XSS) and signature-based verification (like JWT or Sessions) on the backend to avoid spoofing.'
          }
        ]
      }
    }
  });

  // 6. Badges
  await prisma.badge.createMany({
    data: [
      { name: 'First Blood', description: 'Solve your first challenge successfully.', iconUrl: '/badges/first-blood.png', pointsRequired: 0 },
      { name: 'Elite Hacker', description: 'Reach 500 total points on the leaderboard.', iconUrl: '/badges/elite.png', pointsRequired: 500 },
      { name: 'Academy Scholar', description: 'Complete all fundamental lessons.', iconUrl: '/badges/scholar.png', pointsRequired: 100 }
    ]
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
