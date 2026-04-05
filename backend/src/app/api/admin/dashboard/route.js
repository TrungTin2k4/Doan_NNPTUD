import { requireAdmin } from "@/utils/auth";
import { corsPreflight } from "@/utils/cors";
import { ok, withErrorHandling } from "@/utils/http";
import { countPublishedCourses } from "@/controllers/course-service";
import { countCompletedOrders, getTotalRevenue } from "@/controllers/order-service";
import { countUsers } from "@/controllers/user-service";
export async function OPTIONS(request) {
    return corsPreflight(request);
}
export async function GET(request) {
    return withErrorHandling(request, async () => {
        await requireAdmin(request);
        const [totalRevenue, totalStudents, totalCourses, totalOrders] = await Promise.all([
            getTotalRevenue(),
            countUsers(),
            countPublishedCourses(),
            countCompletedOrders(),
        ]);
        return ok(request, {
            totalRevenue,
            totalStudents,
            totalCourses,
            totalOrders,
        });
    });
}
