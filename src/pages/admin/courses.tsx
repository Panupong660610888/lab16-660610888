import { useState } from "react";
import { Trash2, X, Plus } from "lucide-react";

import { useEnrollmentStore } from "@/lib/enrollment-store";
import type { Course } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

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

export default function AdminCoursesPage() {
  const courses = useEnrollmentStore((state) => state.courses);
  const addCourse = useEnrollmentStore((state) => state.addCourse);
  const removeCourse = useEnrollmentStore((state) => state.removeCourse);
  const removeInstructor = useEnrollmentStore(
    (state) => state.removeInstructor,
  );

  const [open, setOpen] = useState(false);
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [instructorInput, setInstructorInput] = useState("");
  const anchor = useComboboxAnchor();

  const instructorNames = Array.from(
    new Set(courses.flatMap((course) => course.instructors ?? [])),
  );

  const isDuplicate = courses.some(
    (course) =>
      course.courseCode?.toLowerCase() === courseCode.trim().toLowerCase(),
  );

  const handleAddCourse = () => {
    if (!courseCode.trim() || !courseTitle.trim() || isDuplicate) {
      return;
    }

    const newCourse: Course = {
      courseCode: courseCode.trim(),
      courseTitle: courseTitle.trim(),
      instructors: selectedInstructors,
    };

    addCourse(newCourse);

    setCourseCode("");
    setCourseTitle("");
    setSelectedInstructors([]);
    setInstructorInput("");
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">จัดการวิชาเรียน</h1>
          <p className="text-muted-foreground">
            {courses.length} วิชา — เพิ่มวิชาใหม่ที่นี่แล้วจะไปโผล่เป็นตัวเลือก
            ตอนลงทะเบียนให้นักศึกษาที่หน้า "จัดการการลงทะเบียน" ทันที
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button>
                <Plus />
                เพิ่มวิชา
              </Button>
            }
          />

          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
              <DialogDescription>
                วิชาที่เพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาได้ทันที
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="courseCode">รหัสวิชา</Label>
                <Input
                  id="courseCode"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  placeholder="เช่น CPE303"
                  aria-invalid={isDuplicate}
                  className={isDuplicate ? "border-red-500" : ""}
                />

                {isDuplicate && (
                  <p className="text-sm text-red-500">
                    มีรหัสวิชา {courseCode.trim()} นี้แล้ว
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseTitle">ชื่อวิชา</Label>
                <Input
                  id="courseTitle"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="เช่น Mobile Application Development"
                />
              </div>

              <div className="space-y-2">
                <Label>ผู้สอน</Label>

                <Combobox
                  multiple
                  value={selectedInstructors}
                  onValueChange={setSelectedInstructors}
                  inputValue={instructorInput}
                  onInputValueChange={setInstructorInput}
                >
                  <ComboboxChips ref={anchor}>
                    {selectedInstructors.map((instructor) => (
                      <ComboboxChip key={instructor}>{instructor}</ComboboxChip>
                    ))}

                    <ComboboxChipsInput
                      className="min-w-[100px] flex-1"
                      placeholder="เลือกหรือพิมพ์ชื่อผู้สอน (ได้หลายคน)"
                    />
                  </ComboboxChips>

                  <ComboboxContent anchor={anchor}>
                    <ComboboxList>
                      {instructorNames.map((name) => (
                        <ComboboxItem key={name} value={name}>
                          {name}
                        </ComboboxItem>
                      ))}

                      {instructorInput.trim() &&
                        !instructorNames.some(
                          (name) =>
                            name.toLowerCase() ===
                            instructorInput.trim().toLowerCase(),
                        ) && (
                          <ComboboxItem value={instructorInput.trim()}>
                            + เพิ่มผู้สอน "{instructorInput.trim()}"
                          </ComboboxItem>
                        )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleAddCourse}
                disabled={
                  !courseCode.trim() || !courseTitle.trim() || isDuplicate
                }
              >
                บันทึก
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
              <TableHead>ผู้สอน</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.courseCode}>
                <TableCell>{course.courseCode}</TableCell>
                <TableCell>{course.courseTitle}</TableCell>

                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {course.instructors && course.instructors.length > 0 ? (
                      course.instructors.map((instructor) => (
                        <Badge
                          key={instructor}
                          variant="secondary"
                          className="gap-1"
                        >
                          {instructor}

                          <button
                            type="button"
                            onClick={() =>
                              removeInstructor(course.courseCode, instructor)
                            }
                            aria-label={`ลบผู้สอน ${instructor}`}
                          >
                            <X className="size-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">
                        ยังไม่มีผู้สอน
                      </span>
                    )}
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button variant="destructive" size="icon">
                          <Trash2 />
                        </Button>
                      }
                    />

                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ลบวิชา?</AlertDialogTitle>

                        <AlertDialogDescription>
                          ลบ {course.courseCode} —{course.courseTitle}
                          ออกจากวิชาที่เปิดสอน
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>

                        <AlertDialogAction
                          onClick={() => removeCourse(course.courseCode)}
                        >
                          ยืนยัน
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
