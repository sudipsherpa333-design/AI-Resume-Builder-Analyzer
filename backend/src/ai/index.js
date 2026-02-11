import aiRoutes from "./ai.routes.js";

export const mountAI = (app) => {
    app.use("/api/ai", aiRoutes);
};
