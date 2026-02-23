import { requireAdmin } from "@/lib/auth";
import { corsPreflight } from "@/lib/cors";
import { ok, withErrorHandling } from "@/lib/http";
import { countPublishedCourses } from "@/lib/services/course-service";
import { countCompletedOrders, getTotalRevenue } from "@/lib/services/order-service";
import { countUsers } from "@/lib/services/user-service";
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
