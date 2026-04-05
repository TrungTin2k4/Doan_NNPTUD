# EduLearn Design System

## Muc tieu

- Giu giao dien dong bo giua `Home`, `Courses`, `Login`, `Register` va cac man se lam tiep theo.
- Uu tien cac block co the tai su dung thay vi viet lai JSX va CSS cho tung man.
- Dung mot file style chinh: `src/index.css`.

## Typography

- `Fraunces`: display va heading
- `Plus Jakarta Sans`: body, label, UI text

### Variants

- `.type-display-3xl`: hero title
- `.type-display-2xl`: section title
- `.type-display-compact`: metric number / short hero title
- `.type-title-lg`: card title lon
- `.type-title-sm`: card title nho
- `.type-body-lg`: doan mo ta lon
- `.type-body-md`: body mac dinh
- `.type-body-sm`: body nho
- `.type-label`: overline / eyebrow
- `.type-caption`: sub meta

## Color Tokens

- `--color-canvas`: nen tong the
- `--color-surface`: section nen
- `--color-elevated`: card noi
- `--color-ink-*`: he text
- `--color-brand-*`: CTA chinh, highlight am
- `--color-accent-*`: secondary action, nhan thong tin
- `--color-line`: border, divider

## Component Reuse Rules

- `SectionHeading`: dung cho heading cua moi section lon.
- `CourseCard`: dung chung cho Home va Courses; khi co man detail hoac dashboard preview co the dung lai.
- `FeatureCard`: dung cho nhom chuc nang / service highlights.
- `TestCard`: dung cho checklist, testing flow, onboarding steps.
- `AuthHighlightCard`: dung cho panel phu ben canh Login / Register.
- `Navbar`: dung chung cho tat ca public pages.

## Nguyen tac tai su dung section

- Neu mot section da xuat hien o `Home`, uu tien copy layout va component tu `Home` sang man khac.
- Chi thay data truoc khi thay bo cuc.
- Giu nguyen radius, spacing, heading hierarchy va button style.
- Khong tao bien the moi neu block hien tai da du cho use case do.

## File chinh

- `src/index.css`: tokens, utilities, component classes
- `src/components/common/*`: reusable blocks
- `src/components/layout/*`: shell, navbar
- `src/pages/*`: page implementations
- `src/data/content.js`: mock content cho prototype
