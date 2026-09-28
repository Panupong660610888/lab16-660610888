import { useState } from "react";
import { PlusCircle, X } from "lucide-react";

import { useEnrollmentStore } from "@/lib/enrollment-store";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Combobox,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  useComboboxAnchor,
} from "@/components/ui/combobox";

export default function AdminEnrollmentsPage() {
  const students = useEnrollmentStore((state) => state.students);
  const courses = useEnrollmentStore((state) => state.courses);
  const enrollStudents = useEnrollmentStore((state) => state.enrollStudents);
  const dropEnrollment = useEnrollmentStore((state) => state.dropEnrollment);

  const [open, setOpen] = useState(false);
  const [formCourse, setFormCourse] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const anchor = useComboboxAnchor();

  const availableStudents = students.filter(
    (student) => !student.enrolledCourses.includes(formCourse),
  );

  const handleEnroll = () => {
    if (!formCourse || selectedStudents.length === 0) return;

    enrollStudents(formCourse, selectedStudents);

    setSelectedStudents([]);
    setFormCourse("");
    setOpen(false);
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);

    if (!value) {
      setFormCourse("");
      setSelectedStudents([]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">จัดการการลงทะเบียน</h1>

          <p className="text-muted-foreground">
            Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
          </p>
        </div>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger
            render={
              <Button>
                <PlusCircle className="size-4" />
                ลงทะเบียนให้นักศึกษา
              </Button>
            }
          />

          <DialogContent>
            <DialogHeader>
              <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>

              <DialogDescription>
                เลือกวิชาก่อน แล้วเลือกนักศึกษาที่ยังไม่ได้ลงทะเบียนวิชานั้น
                (เลือกได้มากกว่า 1 คน)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">วิชาเรียน</label>

                <Select
                  value={formCourse}
                  onValueChange={(value) => {
                    setFormCourse(value ?? "");
                    setSelectedStudents([]);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="เลือกวิชาเรียน" />
                  </SelectTrigger>

                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem
                        key={course.courseCode}
                        value={course.courseCode}
                      >
                        {course.courseCode} — {course.courseTitle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">นักศึกษา</label>

                <Combobox
                  multiple
                  value={selectedStudents}
                  onValueChange={setSelectedStudents}
                  disabled={!formCourse}
                >
                  <div ref={anchor} className="w-full min-w-0">
                    <ComboboxChips className="flex w-full min-w-0 flex-wrap gap-1">
                      {selectedStudents.map((studentId) => {
                        const student = students.find(
                          (s) => s.studentId === studentId,
                        );

                        return (
                          <ComboboxChip key={studentId}>
                            {student
                              ? `${student.firstName} ${student.lastName}`
                              : studentId}
                          </ComboboxChip>
                        );
                      })}

                      <ComboboxChipsInput
                        className="min-w-0 flex-1"
                        placeholder={
                          !formCourse
                            ? "เลือกวิชาก่อน"
                            : selectedStudents.length === 0
                              ? "ค้นหา/เลือกนักศึกษา"
                              : ""
                        }
                      />
                    </ComboboxChips>
                  </div>

                  <ComboboxContent anchor={anchor}>
                    <ComboboxList>
                      {availableStudents.map((student) => (
                        <ComboboxItem
                          key={student.studentId}
                          value={student.studentId}
                        >
                          {student.studentId} — {student.firstName}{" "}
                          {student.lastName}
                        </ComboboxItem>
                      ))}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleEnroll}
                disabled={!formCourse || selectedStudents.length === 0}
              >
                <PlusCircle className="size-4" />
                ลงทะเบียน ({selectedStudents.length} คน)
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>จำนวน นศ.</TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {courses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  ยังไม่มีวิชาเรียน
                </TableCell>
              </TableRow>
            )}

            {courses.map((course) => {
              const enrolledStudents = students.filter((student) =>
                student.enrolledCourses.includes(course.courseCode),
              );

              return (
                <TableRow key={course.courseCode}>
                  <TableCell>{course.courseCode}</TableCell>

                  <TableCell>{course.courseTitle}</TableCell>

                  <TableCell>{enrolledStudents.length} คน</TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {enrolledStudents.length > 0 ? (
                        enrolledStudents.map((student) => (
                          <Badge
                            key={student.studentId}
                            variant="secondary"
                            className="gap-1"
                          >
                            {student.firstName} {student.lastName}
                            <button
                              type="button"
                              onClick={() =>
                                dropEnrollment(
                                  course.courseCode,
                                  student.studentId,
                                )
                              }
                              aria-label={`ยกเลิกการลงทะเบียน ${student.firstName} ${student.lastName}`}
                            >
                              <X className="size-3" />
                            </button>
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">
                          ยังไม่มีนักศึกษาลงทะเบียน
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
