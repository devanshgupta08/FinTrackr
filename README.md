# ✨ FinTrackr 📝

> A **full-stack blogging platform** built with the **MERN stack** (MongoDB, Express.js, React, Node.js), offering smooth content management, user interaction, and modern web features.  
>  
> ![Hero Section](Screenshots/herodark.png)

---

## 🚀 Deployment

- 🔗 **Frontend**: [Vercel](https://blog-space-blond.vercel.app)  
- 🔗 **Backend**: [Render](https://blogspace-1-kjm6.onrender.com)

---

## 🌟 Features Overview

<details open>
<summary>🔐 <strong>Google OAuth Login</strong></summary>

Users can sign in using their **Google account**, ensuring secure and fast authentication.  
No need to remember separate passwords!

<br>

![Google OAuth Login](Screenshots/login.png)

</details>

---

<details open>
<summary>🏠 <strong>Home Page with Blogs</strong></summary>

The homepage displays all blog posts fetched from the backend, featuring pagination and real-time updates.  
Users can scroll through featured content easily.

<br>

![Home Page](Screenshots/allpost.png)

</details>

---

<details open>
<summary>🔍 <strong>Search & Filter Blogs</strong></summary>

Users can search blog posts by **title or content**, and filter results by **date** for quicker access to relevant posts.

<br>

![Search and Filter](Screenshots/search.png)

</details>

---

<details open>
<summary>✍️ <strong>Admin-Only Blog Creation</strong></summary>

Only **admin users** can create and publish blog posts.  
The form is optimized using **React Hook Form** and **Zod** for validation.

<br>

![Create Blog](Screenshots/createpost.png)  
![Create Blog](Screenshots/createpost2.png)

</details>

---

<details open>
<summary>📝 <strong>Blog Detail Page</strong></summary>

Clicking on a blog opens the full content, where users can **read**, **like**, and **comment** on the post.

<br>

![Blog Detail View](Screenshots/post.png)

</details>

---

<details open>
<summary>❤️ <strong>Like & Comment</strong></summary>

Users can like blog posts and leave comments to engage with authors and readers.

<br>

![Like and Comment](Screenshots/comment.png)

</details>

---

<details open>
<summary>⚙️ <strong>Admin Dashboard</strong></summary>

Admins have access to a powerful dashboard to **manage users, posts, and comments**.  
They can update or delete any content as needed.

<br>

![Admin Dashboard](Screenshots/dashboard1.png)  
![Admin Dashboard](Screenshots/dashboard2.png)  
![Admin Dashboard](Screenshots/dashboard3.png)  
![Admin Dashboard](Screenshots/dashboard4.png)

</details>

---

<details open>
<summary>🖼️ <strong>Cloudinary Image Upload</strong></summary>

Images for blogs and profiles are uploaded directly to **Cloudinary**, ensuring fast delivery and automatic optimization.

</details>

---

<details open>
<summary>🌓 <strong>Theme Toggle (Dark / Light Mode)</strong></summary>

Switch between **light and dark themes** based on user preference.  
Theme choice is **persisted across sessions**.

<br>

**Light Mode**  
<br>
![Light Mode](Screenshots/herolight.png)

<br>

**Dark Mode**  
<br>
![Dark Mode](Screenshots/herodark.png)

</details>

---

<details open>
<summary>👤 <strong>Profile Management</strong></summary>

Users can update their **name, profile picture**, and other details from their profile section.

<br>

![Profile Page](Screenshots/profile.png)

</details>

---

<details open>
<summary>📑 <strong>Pagination</strong></summary>

Large lists of blog posts are **paginated** for better performance and smoother user experience.

</details>

---

## 🛠️ Technologies Used

| Layer        | Tech Stack                                                                       |
|--------------|-----------------------------------------------------------------------------------|
| **Frontend** | React, React Router DOM, Redux, React Query, DaisyUI, React Hook Form            |
| **Backend**  | Node.js, Express.js, MongoDB, Mongoose, Zod, bcrypt, Cloudinary                  |
| **Auth**     | Google OAuth                                                                     |
| **Utilities**| Slugify, CORS, JWT                                                               |

---
