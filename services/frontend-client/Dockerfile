FROM nginx:alpine

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create a simple index.html for demo purposes
RUN echo '<!DOCTYPE html><html><head><title>CI/CD Pipeline</title></head><body><h1>CI/CD Pipeline Frontend</h1><p>Frontend is running successfully!</p></body></html>' > /usr/share/nginx/html/index.html

# Expose port
EXPOSE 3000

# Start nginx
CMD ["nginx", "-g", "daemon off;"]