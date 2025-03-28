# GPA Calculator

A modern web application for calculating GPA with a beautiful user interface.

## Features

- College and Program Selection
- Academic Year and Semester Selection
- Elective Course Management
- GPA Calculation
- Responsive Design
- Modern UI with Animations

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Axios

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gpa-calculator.git
cd gpa-calculator
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Build for production:
```bash
npm run build
# or
yarn build
```

## Deployment

This project is configured for deployment on Netlify. To deploy:

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Configure your custom domain (kodin.co.tz) in Netlify settings
4. Deploy!

### Custom Domain Setup

1. Go to your Netlify dashboard
2. Navigate to Site settings > Domain management
3. Add your custom domain: kodin.co.tz
4. Follow Netlify's DNS configuration instructions
5. Add the following DNS records to your domain provider:
   - Type: A
   - Name: @
   - Value: 75.2.60.5
   - Type: CNAME
   - Name: www
   - Value: your-netlify-site.netlify.app

## License

This project is licensed under the MIT License - see the LICENSE file for details.
