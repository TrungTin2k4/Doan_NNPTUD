import process from "node:process";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:8080";

let passed = 0;
let failed = 0;

function pass(message) {
  passed += 1;
  console.log(`PASS: ${message}`);
}

function fail(message, context) {
  failed += 1;
  console.error(`FAIL: ${message}`);
  if (context !== undefined) {
    console.error(context);
  }
}

function expect(condition, message, context) {
  if (condition) {
    pass(message);
  } else {
    fail(message, context);
  }
}

async function api(path, options = {}) {
  const {
    method = "GET",
    token,
    body,
    isFormData = false,
    extraHeaders = {},
  } = options;

  const headers = new Headers(extraHeaders);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  let payload = null;
  const responseText = await response.text();
  if (responseText.length > 0) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      payload = responseText;
    }
  }

  return {
    status: response.status,
    payload,
  };
}

function dataOf(result) {
  return result?.payload?.data ?? null;
}

function messageOf(result) {
  return result?.payload?.message ?? null;
}

async function main() {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const userEmail = `smoke-${suffix}@example.com`;
  const userPassword = "Smoke@123456";

  const register = await api("/api/auth/register", {
    method: "POST",
    body: {
      fullName: "Smoke Test User",
      email: userEmail,
      password: userPassword,
    },
  });
  expect(register.status === 200, "register user", register);
  const registerData = dataOf(register);
  let userToken = registerData?.token ?? null;
  expect(typeof userToken === "string" && userToken.length > 20, "register returns JWT token", registerData);

  const login = await api("/api/auth/login", {
    method: "POST",
    body: {
      email: userEmail,
      password: userPassword,
    },
  });
  expect(login.status === 200, "login user", login);
  const loginData = dataOf(login);
  expect(typeof loginData?.token === "string", "login returns JWT token", loginData);
  userToken = loginData?.token ?? userToken;

  const me = await api("/api/auth/me", {
    token: userToken,
  });
  expect(me.status === 200, "get current profile", me);

  const mySessions = await api("/api/auth/sessions?page=0&size=10", {
    token: userToken,
  });
  expect(mySessions.status === 200, "list my sessions", mySessions);
  const sessionList = dataOf(mySessions)?.sessions ?? [];
  expect(sessionList.length >= 1, "session list returns at least one active session", sessionList);
  if (sessionList.length > 1) {
    const oldestSession = sessionList[sessionList.length - 1];
    const revokeSession = await api(`/api/auth/sessions/${oldestSession.id}`, {
      method: "DELETE",
      token: userToken,
    });
    expect(revokeSession.status === 200, "revoke one older session", revokeSession);
  }

  const courses = await api("/api/courses?page=0&size=1");
  expect(courses.status === 200, "list published courses", courses);
  const firstCourse = dataOf(courses)?.courses?.[0] ?? null;
  expect(Boolean(firstCourse?.id) && Boolean(firstCourse?.slug), "courses response contains first course", courses);

  const courseDetail = await api(`/api/courses/${firstCourse.slug}`);
  expect(courseDetail.status === 200, "get course detail by slug", courseDetail);
  const detailData = dataOf(courseDetail);
  const firstLessonId = detailData?.sections?.[0]?.lessons?.[0]?.id ?? null;
  expect(typeof firstLessonId === "string", "course detail contains lesson id", detailData);

  const cartBefore = await api("/api/cart", {
    token: userToken,
  });
  expect(cartBefore.status === 200, "get my cart", cartBefore);

  const addToCart = await api("/api/cart/items", {
    method: "POST",
    token: userToken,
    body: {
      courseId: firstCourse.id,
    },
  });
  expect(addToCart.status === 200, "add course to cart", addToCart);

  const cartAfterAdd = await api("/api/cart", {
    token: userToken,
  });
  expect(cartAfterAdd.status === 200, "get cart after add", cartAfterAdd);
  const cartAfterAddItems = dataOf(cartAfterAdd)?.items ?? [];
  expect(cartAfterAddItems.some((item) => item.courseId === firstCourse.id), "cart contains selected course", cartAfterAddItems);

  const removeFromCart = await api(`/api/cart/items/${firstCourse.id}`, {
    method: "DELETE",
    token: userToken,
  });
  expect(removeFromCart.status === 200, "remove course from cart", removeFromCart);

  const clearCart = await api("/api/cart", {
    method: "DELETE",
    token: userToken,
  });
  expect(clearCart.status === 200, "clear cart endpoint works", clearCart);

  const uploadForm = new FormData();
  uploadForm.append("purpose", "AVATAR");
  uploadForm.append("file", new Blob(["fake-image-content"], { type: "image/png" }), "avatar.png");
  const upload = await api("/api/upload", {
    method: "POST",
    token: userToken,
    body: uploadForm,
    isFormData: true,
  });
  expect(upload.status === 201, "upload image file", upload);
  const uploadData = dataOf(upload);
  expect(typeof uploadData?.id === "string", "upload returns asset id", uploadData);
  expect(typeof uploadData?.publicUrl === "string", "upload returns public URL", uploadData);

  const updateMe = await api("/api/auth/me", {
    method: "PUT",
    token: userToken,
    body: {
      fullName: "Smoke Test User Updated",
      avatarUrl: uploadData?.publicUrl ?? null,
    },
  });
  expect(updateMe.status === 200, "update profile with uploaded URL", updateMe);

  const uploadList = await api("/api/upload?page=0&size=10", {
    token: userToken,
  });
  expect(uploadList.status === 200, "list my uploads", uploadList);
  const listAssets = dataOf(uploadList)?.assets ?? [];
  expect(listAssets.some((asset) => asset.id === uploadData.id), "uploaded asset appears in list", listAssets);

  const checkout = await api("/api/orders", {
    method: "POST",
    token: userToken,
    body: {
      courseIds: [firstCourse.id],
      paymentMethod: "CARD",
    },
  });
  expect(checkout.status === 200, "checkout order", checkout);
  const orderData = dataOf(checkout);
  expect(typeof orderData?.id === "string", "checkout returns order id", orderData);

  const adminLogin = await api("/api/auth/login", {
    method: "POST",
    body: {
      email: "admin@edulearn.local",
      password: "Admin@123456",
    },
  });
  expect(adminLogin.status === 200, "login admin", adminLogin);
  const adminToken = dataOf(adminLogin)?.token ?? null;
  expect(typeof adminToken === "string", "admin login returns token", adminLogin);

  const createCategory = await api("/api/admin/categories", {
    method: "POST",
    token: adminToken,
    body: {
      name: `Smoke Category ${suffix}`,
      description: "Category created by smoke test",
      isActive: true,
    },
  });
  expect(createCategory.status === 201, "admin creates category", createCategory);
  const categoryData = dataOf(createCategory);
  expect(typeof categoryData?.id === "string", "create category returns id", categoryData);
  const categoryId = typeof categoryData?.id === "string" ? categoryData.id : "";
  const categoryName = typeof categoryData?.name === "string" ? categoryData.name : `Smoke Category ${suffix}`;

  const publicCategories = await api("/api/categories");
  expect(publicCategories.status === 200, "public category list works", publicCategories);
  const publicCategoryList = dataOf(publicCategories) ?? [];
  expect(publicCategoryList.some((category) => category.id === categoryId), "created category appears in public list", publicCategoryList);

  const updateCategory = await api(`/api/admin/categories/${categoryId}`, {
    method: "PUT",
    token: adminToken,
    body: {
      name: `${categoryName} Updated`,
      description: "Updated by smoke test",
      isActive: true,
    },
  });
  expect(updateCategory.status === 200, "admin updates category", updateCategory);

  const completeOrder = await api(`/api/admin/orders/${orderData.id}/status`, {
    method: "PATCH",
    token: adminToken,
    body: {
      status: "COMPLETED",
    },
  });
  expect(completeOrder.status === 200, "admin completes order", completeOrder);

  const myEnrollments = await api("/api/enrollments/me?page=0&size=10", {
    token: userToken,
  });
  expect(myEnrollments.status === 200, "get my enrollments", myEnrollments);
  const enrollmentList = dataOf(myEnrollments)?.enrollments ?? [];
  expect(enrollmentList.some((enrollment) => enrollment.courseId === firstCourse.id), "new enrollment appears after completed order", enrollmentList);

  const createReview = await api("/api/reviews", {
    method: "POST",
    token: userToken,
    body: {
      courseId: firstCourse.id,
      rating: 5,
      comment: "Great learning flow",
    },
  });
  expect(createReview.status === 201, "user creates review", createReview);
  const reviewData = dataOf(createReview);
  expect(typeof reviewData?.id === "string", "create review returns id", reviewData);
  const reviewId = typeof reviewData?.id === "string" ? reviewData.id : "";

  const courseReviews = await api(`/api/reviews/course/${firstCourse.id}?page=0&size=10`);
  expect(courseReviews.status === 200, "public course reviews list works", courseReviews);
  const reviewList = dataOf(courseReviews)?.reviews ?? [];
  expect(reviewList.some((review) => review.id === reviewId), "new review appears in course review list", reviewList);

  const updateReview = await api("/api/reviews", {
    method: "POST",
    token: userToken,
    body: {
      courseId: firstCourse.id,
      rating: 4,
      comment: "Updated rating after second watch",
    },
  });
  expect(updateReview.status === 200, "user updates existing review", updateReview);

  const courseProgress = await api(`/api/progress/${firstCourse.id}`, {
    token: userToken,
  });
  expect(courseProgress.status === 200, "get course progress after completion", courseProgress);

  const savePosition = await api(`/api/progress/position/${firstLessonId}`, {
    method: "POST",
    token: userToken,
    body: {
      position: 45,
    },
  });
  expect(savePosition.status === 200, "save video position by lesson id", savePosition);

  const completeLesson = await api("/api/progress/complete", {
    method: "POST",
    token: userToken,
    body: {
      courseId: firstCourse.id,
      lessonId: firstLessonId,
    },
  });
  expect(completeLesson.status === 200, "mark lesson complete", completeLesson);

  const completeInvalidLesson = await api("/api/progress/complete", {
    method: "POST",
    token: userToken,
    body: {
      courseId: firstCourse.id,
      lessonId: "invalid-lesson-id",
    },
  });
  expect(completeInvalidLesson.status === 400, "reject invalid lesson/course relation", completeInvalidLesson);

  const deleteReview = await api(`/api/reviews/${reviewId}`, {
    method: "DELETE",
    token: userToken,
  });
  expect(deleteReview.status === 200, "user deletes own review", deleteReview);

  const logout = await api("/api/auth/logout", {
    method: "POST",
    token: userToken,
  });
  expect(logout.status === 200, "logout user and revoke token", logout);
  expect(messageOf(logout) === "Logout successful", "logout returns success message", logout);

  const meAfterLogout = await api("/api/auth/me", {
    token: userToken,
  });
  expect(meAfterLogout.status === 401, "old token rejected after logout", meAfterLogout);

  const deleteUpload = await api(`/api/upload/${uploadData.id}`, {
    method: "DELETE",
    token: adminToken,
  });
  expect(deleteUpload.status === 200, "admin can delete user upload", deleteUpload);

  const deleteCategory = await api(`/api/admin/categories/${categoryId}`, {
    method: "DELETE",
    token: adminToken,
  });
  expect(deleteCategory.status === 200, "admin deletes category", deleteCategory);

  console.log(`\nSmoke test finished: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Smoke test crashed", error);
  process.exit(1);
});
