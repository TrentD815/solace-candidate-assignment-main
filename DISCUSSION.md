With more time I would do the following:
- Frontend
    - Add a skeleton loader so that a proper placeholder is shown before the data is pulled from the backend
    - Add accessibility to all elements
    - Add mobile responsiveness so the table formats better on smaller screens
    - Add light/dark theme
    - Modularize codebase a bit. Move sorting functions and styles to a dedicated file, etc
- Backend
    - Rate limiting to prevent users from hitting the API too often
    - Caching of responses to prevent unecessary API calls if the data was already retrieved