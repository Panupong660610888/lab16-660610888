import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  students as initialStudents,
  courses as initialCourses,
} from "@/lib/mock-data";
import type { Course, Enrollment, Student } from "@/lib/types";

type EnrollmentStore = {
  students: Student[];
  courses: Course[];

  //   /** Admin ลงทะเบียนวิชาให้นักศึกษาคนใดก็ได้ (ไม่ซ้ำกับที่มีอยู่แล้ว) */
  //   enroll: (studentId: string, courseId: string) => void;
  //   /** Admin ยกเลิกการลงทะเบียนของนักศึกษาคนใดก็ได้ */
  //   drop: (studentId: string, courseId: string) => void;
  //   /** ลบนักศึกษา พร้อมการลงทะเบียนทั้งหมดของคนนั้น */
  //   removeStudent: (studentId: string) => void;
  //   /** ลบวิชาออกจากรายวิชาที่เปิดสอน พร้อม cascade ลบ enrollment ที่อ้างถึงวิชานั้นทั้งหมด */
  //   removeCourse: (courseId: string) => void;

  addCourse: (course: Course) => void;
  removeCourse: (courseCode: string) => void;
  removeInstructor: (courseCode: string, instructor: string) => void;
  enrollStudents: (courseCode: string, studentIds: string[]) => void;
  dropEnrollment: (courseCode: string, studentId: string) => void;
  removeStudent: (studentId: string) => void;
};

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set) => ({
      students: initialStudents,
      courses: initialCourses,

      addCourse: (course) =>
        set((state) => ({
          courses: [...state.courses, course],
        })),

      enrollStudents: (courseCode, studentIds) =>
        set((state) => ({
          students: state.students.map((s) =>
            studentIds.includes(s.studentId)
              ? {
                  ...s,
                  enrolledCourses: s.enrolledCourses.includes(courseCode)
                    ? s.enrolledCourses
                    : [...s.enrolledCourses, courseCode],
                }
              : s,
          ),
        })),

      dropEnrollment: (courseCode, studentId) =>
        set((state) => ({
          students: state.students.map((s) =>
            s.studentId === studentId
              ? {
                  ...s,
                  enrolledCourses: s.enrolledCourses.filter(
                    (code) => code !== courseCode,
                  ),
                }
              : s,
          ),
        })),

      removeStudent: (studentId) =>
        set((state) => ({
          students: state.students.filter((s) => s.studentId !== studentId),
        })),

      removeCourse: (courseCode) =>
        set((state) => ({
          courses: state.courses.filter((c) => c.courseCode !== courseCode),
          students: state.students.map((s) => ({
            ...s,
            enrolledCourses: s.enrolledCourses.filter(
              (code) => code !== courseCode,
            ),
          })),
        })),

      removeInstructor: (courseCode, instructor) =>
        set((state) => ({
          courses: state.courses.map((c) =>
            c.courseCode === courseCode
              ? {
                  ...c,
                  instructors: (c.instructors ?? []).filter(
                    (name) => name !== instructor,
                  ),
                }
              : c,
          ),
        })),
    }),
    {
      name: "lab16-2569-660610888",
      partialize: (state) => ({
        students: state.students,
        courses: state.courses,
      }),
    },
  ),
);
