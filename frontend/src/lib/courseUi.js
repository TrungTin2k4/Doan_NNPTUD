export function formatPrice(value) {
  const amount = Number(value ?? 0)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function buildCourseCardModel(course, options = {}) {
  const summary = course.description || 'This course uses a clean, practical layout that is easy to browse and test.'

  return {
    id: course.id,
    slug: course.slug,
    level: course.level || 'All level',
    title: course.title,
    summary,
    thumbnail: course.thumbnail || null,
    stats:
      options.stats ||
      [course.duration ? `${course.duration} min` : null, course.category || null]
        .filter(Boolean)
        .join(' / '),
    tone: options.tone || 'brand',
    tag: options.tag || course.category || 'Course',
    price: formatPrice(course.price),
  }
}
