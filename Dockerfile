# Use Node.js LTS (Bullseye contains necessary build tools if needed)
FROM node:20-bullseye-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy app source source
COPY . .

# Expose the port
ENV PORT=5000
EXPOSE 5000

# Start the application
CMD [ "npm", "start" ]
