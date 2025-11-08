"use client";

import type React from "react";

import { useState, useEffect } from "react";
import type { Student } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StudentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (student: Student | Omit<Student, "id">) => void;
  student?: Student;
  isLoading?: boolean;
}

const classes = ["Class A", "Class B", "Class C"];

export function StudentDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  student,
  isLoading,
}: Readonly<StudentDialogProps>) {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    class: string;
    status: "active" | "inactive";
    enrollmentDate: string;
  }>({
    name: "",
    email: "",
    class: "",
    status: "active",
    enrollmentDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        email: student.email,
        class: student.class,
        status: student.status,
        enrollmentDate: student.enrollmentDate,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        class: "",
        status: "active",
        enrollmentDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [student, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.class) {
      return;
    }

    if (student) {
      onSubmit({
        ...student,
        ...formData,
      });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {student ? "Edit Student" : "Add New Student"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Student name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">Class</Label>
            <Select
              value={formData.class}
              onValueChange={(value) =>
                setFormData({ ...formData, class: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as "active" | "inactive",
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="enrollmentDate">Enrollment Date</Label>
            <Input
              id="enrollmentDate"
              type="date"
              value={formData.enrollmentDate}
              onChange={(e) =>
                setFormData({ ...formData, enrollmentDate: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {student ? "Update Student" : "Add Student"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
