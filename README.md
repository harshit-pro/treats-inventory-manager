# 🍬 Treats Inventory Manager
A professional, feature-rich frontend for the **Sweet Shop inventory management system**. Built with modern web technologies, this application provides a seamless user experience for both customers and administrators. It showcases a clean, responsive design and a robust feature set for managing a confectionery business.

## ✨ Features
  * **Modern UI/UX:** A beautiful and intuitive interface built with **React**, **TypeScript**, and **shadcn/ui**.
  * **User Authentication:** Secure login and registration for customers and administrators.
  * **Interactive Dashboard:** Browse, search, and filter a wide variety of sweets.
  * **Admin Panel:** A comprehensive dashboard for administrators to perform CRUD (Create, Read, Update, Delete) operations on the sweets inventory.
  * **Image Uploads:** Seamless image uploading for sweets, integrated with a backend service.
  * **Responsive Design:** Fully responsive layout that works on desktops, tablets, and mobile devices.
  * **State Management:** Efficient state management using **React Query** for server-state and React Context for global UI state.

-----

## ⚙️ Tech Stack

  * **Frontend:** [React](https://react.dev/) ([TypeScript](https://www.typescriptlang.org/)), [Vite](https://vitejs.dev/)
  * **Styling:** [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
  * **State Management:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
  * **Routing:** [React Router](https://reactrouter.com/)
  * **API Communication:** [Axios](https://axios-http.com/)

This project is the frontend client for the [Kata Sweet Shop backend](https://www.google.com/search?q=https://github.com/harshit-pro/kata_sweet_shop_management).

-----

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

  * [Node.js](https://nodejs.org/) (v18 or later recommended)
  * [npm](https://www.npmjs.com/) or any other package manager.
  * A running instance of the [backend server](https://www.google.com/search?q=https://github.com/harshit-pro/kata_sweet_shop_management).

### Installation

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/harshit-pro/treats-inventory-manager.git
    cd treats-inventory-manager
    ```

2.  **Install NPM packages:**

    ```sh
    npm install
    ```

3.  **Configure Environment Variables:**

    Create a `.env` file in the root of the project and add the following variables. These are used for image delivery from Cloudinary.

    ```env
    VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    VITE_CLOUDINARY_UPLOAD_PRESET=your_cloudinary_upload_preset
    ```

4.  **Run the development server:**

    ```sh
    npm run dev
    ```

    The application will be available at `http://localhost:5175`.

### Available Scripts

  * `npm run dev`: Starts the development server.
  * `npm run build`: Builds the app for production.
  * `npm run lint`: Lints the code using ESLint.
  * `npm run preview`: Serves the production build locally for preview.

-----

## 🤖 My AI Usage

I utilized various AI tools to enhance my development workflow and improve the quality of the project.

### Tools Used

  * **GitHub Copilot:** For autocompleting code, generating boilerplate, and suggesting implementations for functions.
  * **ChatGPT:** To brainstorm component structures, debug complex issues, and generate documentation.
  * **Gemini:** For refining API logic, improving user experience, and creating professional documentation like this README.

### How I Used Them

  * I used **GitHub Copilot** extensively within my IDE to speed up the creation of React components, utility functions, and API service files. It was particularly helpful for writing repetitive code like form handling and state management logic.
  * I turned to **ChatGPT** when I encountered challenging bugs or needed to explore different approaches for implementing features like filtering and searching on the dashboard. It also helped in writing clear and concise error messages for the UI.
  * I leveraged **Gemini** to structure the overall project, design the API interactions in `src/lib/api.ts`, and generate a polished and professional `README.md` file that effectively communicates the project's features and setup.

📸 Screenshots

<img width="1466" height="823" alt="image" src="https://github.com/user-attachments/assets/813041a7-ea9a-473e-a4c8-cee0803ba165" />
<img width="1470" height="824" alt="image" src="https://github.com/user-attachments/assets/beaf39ed-1c2c-48dd-8f23-e0371505c86f" />
<img width="1442" height="729" alt="image" src="https://github.com/user-attachments/assets/6ed81ea7-0abf-463d-8100-b8b2191d3c66" />
<img width="1461" height="856" alt="image" src="https://github.com/user-attachments/assets/ff1579b6-cfe3-47ca-98a6-3f81b7bc9651" />
<img width="1438" height="769" alt="image" src="https://github.com/user-attachments/assets/988309c2-ad6f-40ff-b7cc-f329044088de" />
<img width="773" height="860" alt="image" src="https://github.com/user-attachments/assets/3656cdbb-b79a-43f0-bc84-503d1eba7f6b" />
<img width="1023" height="849" alt="image" src="https://github.com/user-attachments/assets/7f23b541-ea29-461b-9624-19d373fe596f" />
<img width="1105" height="561" alt="image" src="https://github.com/user-attachments/assets/fa5847f1-27dd-496e-8d72-2a62c8ed6887" />
<img width="801" height="643" alt="image" src="https://github.com/user-attachments/assets/adfa66e3-9b71-4da1-94ae-670cc27178ad" />
<img width="1468" height="676" alt="image" src="https://github.com/user-attachments/assets/724ca6d0-ce94-4a7b-b18c-68f9b5e05708" />
<img width="1452" height="848" alt="image" src="https://github.com/user-attachments/assets/beb4a22d-db0b-4ac3-946a-9fd6368043f7" />


### Reflection


AI tools were instrumental in accelerating the development process and allowing me to focus more on high-level architecture and user experience. They served as a powerful pair-programming partner, offering suggestions and solutions that I could adapt and integrate into the project. While AI provided a significant boost in productivity, I ensured that all generated code was thoroughly reviewed and tested to meet the project's quality standards.

-----

## 📝 License

This project is open-source and available under the MIT License.
