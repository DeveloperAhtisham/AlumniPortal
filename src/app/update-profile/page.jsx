"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, ArrowRight, User, Mail, Briefcase, Building, MapPin, Phone, Linkedin, Github, X } from "lucide-react"
import axios from 'axios'
import Link from 'next/link'
import { useSelector, useDispatch } from "react-redux"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// importing urls and services
import { getUserInfoUrl, updateUserProfileUrl, deleteAssetUrl } from "@/urls/urls.js"
import useCloudinaryImageUploader from "@/services/cloudinary"
import { useToast } from "@/hooks/use-toast"

// Import data arrays
import { collegeName } from '@/data/college'
import { branch } from '@/data/branch'
import { batch } from '@/data/batch'
import Navbar2 from "@/components/header/Navbar2"
import { UpdateAlumniProfile } from "@/features/alumni/alumniSlice"

export default function ProfileForm() {
  const dispatch = useDispatch()
  const { toast } = useToast()
  const userData = useSelector((state) => state?.userInfo?.userData)
  
  const {
    previewUrl,
    uploading,
    handleImageChange,
    uploadImage
  } = useCloudinaryImageUploader()

  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Form state management
  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    email: "",
    profileImage: "",
    collegeName: "",
    branch: "",
    batch: "",
    about: "",
    location: "",
    contactNumber: "",
    linkedin: "",
    github: "",
    skills: [],
    experiences: [],
    education: []
  })

  // New entries forms
  const [newExperience, setNewExperience] = useState({
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    description: ''
  })
  
  const [newEdu, setNewEdu] = useState({
    collegeName: '',
    course: '',
    branch: '',
    startDate: '',
    endDate: '',
  })

  // Load user data from Redux store on component mount
  useEffect(() => {
    if (userData) {
      populateFormData(userData)
    }
  }, [userData])

  // Format data from API format to form format
  function populateFormData(userData) {
    if (!userData) return

    // Format experiences
    const formattedExperiences = userData.experience ? userData.experience.map(exp => ({
      company: exp.companyName || "",
      position: exp.role || "",
      startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : "",
      endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : "",
      description: exp.description || ""
    })) : []
    
    // Format education
    const formattedEducation = userData.education ? userData.education.map(edu => ({
      collegeName: edu.universityName || "",
      course: edu.degree || "",
      branch: userData.branch || "",
      startDate: edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : "",
      endDate: edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : ""
    })) : []
    
    setFormData({
      userId: userData?._id || "",
      name: userData?.userId?.name || "",
      email: userData?.userId?.email || "",
      profileImage: userData?.profileImage || "",
      collegeName: userData?.collegeName || "",
      branch: userData?.branch || "",
      batch: userData?.batch || "",
      about: userData?.about || "",
      location: userData?.contactInfo?.location || "",
      contactNumber: userData?.contactNumber || "",
      linkedin: userData?.contactInfo?.linkedin || "",
      github: userData?.contactInfo?.github || "",
      skills: userData?.skills || [],
      experiences: formattedExperiences,
      education: formattedEducation
    })
  }

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle dropdown select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle skills input (comma-separated)
  const handleSkillsChange = (e) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean)
    setFormData(prev => ({ ...prev, skills: skillsArray }))
  }

  // Experience form handlers
  const handleExperienceChange = (e) => {
    const { name, value } = e.target
    setNewExperience(prev => ({ ...prev, [name]: value }))
  }

  const addExperience = () => {
    // Validate required fields
    if (!newExperience.company || !newExperience.position || !newExperience.startDate) {
      toast({
        title: "Missing information",
        description: "Please fill in the required experience fields",
        variant: "destructive",
        duration: 2000
      })
      return
    }
    
    setFormData(prev => ({ 
      ...prev, 
      experiences: [...prev.experiences, newExperience] 
    }))
    
    // Reset form
    setNewExperience({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    })
  }

  const removeExperience = (index) => {
    const updatedExperiences = [...formData.experiences]
    updatedExperiences.splice(index, 1)
    setFormData(prev => ({ ...prev, experiences: updatedExperiences }))
  }

  // Education form handlers
  const handleEduChange = (e) => {
    const { name, value } = e.target
    setNewEdu(prev => ({ ...prev, [name]: value }))
  }

  const addEdu = () => {
    // Validate required fields
    if (!newEdu.collegeName || !newEdu.course || !newEdu.startDate) {
      toast({
        title: "Missing information",
        description: "Please fill in the required education fields",
        variant: "destructive",
        duration: 2000
      })
      return
    }
    
    setFormData(prev => ({ 
      ...prev, 
      education: [...prev.education, newEdu] 
    }))
    
    // Reset form
    setNewEdu({
      collegeName: '',
      course: '',
      branch: '',
      startDate: '',
      endDate: '',
    })
  }

  const removeEdu = (index) => {
    const updatedEdu = [...formData.education]
    updatedEdu.splice(index, 1)
    setFormData(prev => ({ ...prev, education: updatedEdu }))
  }

  // Submit form data
  async function handleSubmit(e) {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Format data for API according to the expected structure
      const profileData = {
        userId: formData.userId,
        contactInfo: {
          linkedin: formData.linkedin,
          github: formData.github,
          email: formData.email,
          location: formData.location
        },
        about: formData.about,
        skills: formData.skills,
        batch: formData.batch,
        branch: formData.branch,
        collegeName: formData.collegeName,
        contactNumber: formData.contactNumber,
        experience: formData.experiences.map(exp => ({
          companyName: exp.company,
          isPresent: !exp.endDate,
          description: exp.description,
          role: exp.position,
          startDate: exp.startDate,
          endDate: exp.endDate
        })),
        education: formData.education.map(edu => ({
          universityName: edu.collegeName,
          degree: edu.course,
          startDate: edu.startDate,
          endDate: edu.endDate,
          isPresent: !edu.endDate
        }))
      }

      // Dispatch the Redux action
      const result = await dispatch(UpdateAlumniProfile(profileData)).unwrap()
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
        variant: "green",
        duration: 2000
      })
    } catch (error) {
      console.error("Update error:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
        duration: 2000
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Update profile image
  async function updateProfileImage() {
    setIsLoading(true)
    
    try {
      // Get previous image ID for cleanup
      const prevImagePubId = formData.profileImage.replace("https://res.cloudinary.com/dcqgytpzz/image/upload/", "")?.split("/")[1]?.split(".")[0]
      
      // Upload new image
      const imageInfo = await uploadImage()
      if (!imageInfo) {
        throw new Error("Image upload failed")
      }
      
      // Update profile with new image
      const profileImageData = {
        userId: formData.userId,
        profileImage: imageInfo.secure_url
      }
      
      await dispatch(UpdateAlumniProfile(profileImageData)).unwrap()
      
      // Update form data state
      setFormData(prev => ({ ...prev, profileImage: imageInfo.secure_url }))
      
      // Delete old image if exists
      if (prevImagePubId) {
        await axios.post(deleteAssetUrl, { publicId: prevImagePubId })
      }
      
      toast({
        title: "Success",
        description: "Profile image updated successfully",
        variant: "green",
        duration: 2000
      })
      
      setIsOpen(false)
    } catch (error) {
      console.error("Image update error:", error)
      toast({
        title: "Error",
        description: "Failed to update profile image",
        variant: "destructive",
        duration: 2000
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Navbar2 />
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-4xl mx-auto">
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-10 md:py-16 sm:px-6 lg:px-8 mb-10 rounded-t-lg">
            <h1 className="text-2xl sm:text-3xl font-bold pb-5 text-white">Edit Profile</h1>
            <div className="mb-6 flex justify-center">
              <Avatar className="w-32 h-32 border-4 border-white">
                <AvatarImage src={userData?.profileImage} alt={userData?.userId?.name || 'User'} />
                <AvatarFallback>{userData?.userId?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button size="icon" className="bg-transparent mt-[60px] text-white shadow-none hover:bg-transparent">
                    <Pencil className="w-5 hover:text-gray-800 transition-all duration-200" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-center">Edit Profile Image</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="profileImage" className="text-right">
                        Profile Image
                      </Label>
                      <Input id="profileImage" onChange={handleImageChange} type="file" accept="image/*" className="col-span-3" />
                    </div>
                    {previewUrl && (
                      <div className="flex justify-center">
                        <img src={previewUrl} alt="Preview" className="max-h-40 rounded" />
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button disabled={isLoading || !previewUrl} onClick={updateProfileImage} type="button">
                      {isLoading ? "Uploading..." : "Save changes"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <p className="mt-2 text-center text-sm text-white mb-6">
              Update your profile information{' '}
              <Link
                href={`/profile/${userData?._id}`}
                className="font-semibold text-black transition-all duration-200 hover:underline"
              >
                Go to Profile
              </Link>
            </p>
          </div>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="w-full flex flex-row mb-6 justify-evenly">
                <TabsTrigger className="flex-grow sm:flex-grow-0 text-xs sm:text-sm py-2 px-[2px] md:px-10 m-0.5 sm:m-1 rounded-sm data-[state=active]:bg-blue-600 data-[state=active]:text-primary-foreground my-1" value="basic">Basic</TabsTrigger>
                <TabsTrigger className="flex-grow sm:flex-grow-0 text-xs sm:text-sm py-2 px-[2px] md:px-10 m-0.5 sm:m-1 rounded-sm data-[state=active]:bg-blue-600 data-[state=active]:text-primary-foreground my-1" value="professional">Professional</TabsTrigger>
                <TabsTrigger className="flex-grow sm:flex-grow-0 text-xs sm:text-sm py-2 px-[2px] md:px-10 m-0.5 sm:m-1 rounded-sm data-[state=active]:bg-blue-600 data-[state=active]:text-primary-foreground my-1" value="education">Education</TabsTrigger>
                <TabsTrigger className="flex-grow sm:flex-grow-0 text-xs sm:text-sm py-2 px-[2px] md:px-10 m-0.5 sm:m-1 rounded-sm data-[state=active]:bg-blue-600 data-[state=active]:text-primary-foreground my-1" value="experience">Experience</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information Tab */}
                <TabsContent value="basic">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <Input
                          type="text"
                          name="name"
                          id="name"
                          className="pl-10"
                          placeholder="Your full name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <Input
                          type="email"
                          name="email"
                          id="email"
                          className="pl-10"
                          placeholder="Your email address"
                          value={formData.email}
                          onChange={handleChange}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </div>
                          <Input
                            type="text"
                            name="location"
                            id="location"
                            className="pl-10"
                            placeholder="Your location"
                            value={formData.location}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Phone</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </div>
                          <Input
                            type="tel"
                            name="contactNumber"
                            id="contactNumber"
                            className="pl-10"
                            placeholder="Your phone number"
                            value={formData.contactNumber}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="collegeName" className="block text-sm font-medium text-gray-700">College Name</label>
                      <Select
                        name="collegeName"
                        value={formData.collegeName}
                        onValueChange={(value) => handleSelectChange('collegeName', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select College" />
                        </SelectTrigger>
                        <SelectContent>
                          {collegeName.map((college, index) => (
                            <SelectItem key={index} value={college}>
                              {college}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="branch" className="block text-sm font-medium text-gray-700">Branch</label>
                        <Select 
                          name="branch" 
                          value={formData.branch} 
                          onValueChange={(value) => handleSelectChange('branch', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {branch.map((b, index) => (
                              <SelectItem key={index} value={b}>
                                {b}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label htmlFor="batch" className="block text-sm font-medium text-gray-700">Batch</label>
                        <Select 
                          name="batch" 
                          value={formData.batch} 
                          onValueChange={(value) => handleSelectChange('batch', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Batch" />
                          </SelectTrigger>
                          <SelectContent>
                            {batch.map((batchItem, index) => (
                              <SelectItem key={index} value={batchItem}>
                                {batchItem}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Professional Tab */}
                <TabsContent value="professional">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                      <div className="mt-1">
                        <Textarea
                          name="about"
                          id="about"
                          rows={3}
                          className="resize-none"
                          placeholder="Tell us a little bit about yourself"
                          value={formData.about}
                          onChange={handleChange}
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        Brief description for your profile. URLs are hyperlinked.
                      </p>
                    </div>
                    <div>
                      <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">LinkedIn</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Linkedin className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <Input
                          type="url"
                          name="linkedin"
                          id="linkedin"
                          className="pl-10"
                          placeholder="Your LinkedIn profile URL"
                          value={formData.linkedin}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="github" className="block text-sm font-medium text-gray-700">GitHub</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Github className="h-5 w-5 text-gray-400" aria-hidden="true" />
                        </div>
                        <Input
                          type="url"
                          name="github"
                          id="github"
                          className="pl-10"
                          placeholder="Your GitHub profile URL"
                          value={formData.github}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills</label>
                      <Input
                        type="text"
                        name="skills"
                        id="skills"
                        placeholder="Add skills (comma-separated)"
                        value={formData.skills.join(', ')}
                        onChange={handleSkillsChange}
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Enter your skills separated by commas (e.g., Machine Learning, Cloud Computing, Data Science)
                      </p>
                    </div>
                  </div>
                </TabsContent>

                {/* Education Tab */}
                <TabsContent value="education">
                  <div className="space-y-4">
                    {formData.education?.map((edu, index) => (
                      <Card key={index} className="relative">
                        <CardHeader className="p-3 sm:p-4">
                          <CardTitle className="text-sm sm:text-base">{edu.course}</CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => removeEdu(index)}
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <CardDescription className="text-xs sm:text-sm">
                            {edu.collegeName} • {edu.startDate || 'N/A'} ~ {edu.endDate || "Present"}
                          </CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                    <Card>
                      <CardHeader>
                        <CardTitle>Add Education</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edu-collegeName">College Name</Label>
                              <Input 
                                id="edu-collegeName" 
                                name="collegeName" 
                                value={newEdu.collegeName} 
                                onChange={handleEduChange} 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edu-course">Degree</Label>
                              <Input 
                                id="edu-course" 
                                name="course" 
                                value={newEdu.course} 
                                onChange={handleEduChange} 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edu-branch">Branch</Label>
                              <Input 
                                id="edu-branch" 
                                name="branch" 
                                value={newEdu.branch} 
                                onChange={handleEduChange} 
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edu-startDate">Start Date</Label>
                              <Input 
                                id="edu-startDate" 
                                name="startDate" 
                                type="date" 
                                value={newEdu.startDate} 
                                onChange={handleEduChange} 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="edu-endDate">End Date</Label>
                              <Input 
                                id="edu-endDate" 
                                name="endDate" 
                                type="date" 
                                value={newEdu.endDate} 
                                onChange={handleEduChange} 
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          type="button" 
                          onClick={addEdu} 
                          className="w-full md:w-1/3 mx-auto"
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add Education
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </TabsContent>

                {/* Experience Tab */}
                <TabsContent value="experience">
                  <div className="space-y-4">
                    {formData.experiences?.map((exp, index) => (
                      <Card key={index} className="relative">
                        <CardHeader>
                          <CardTitle>{exp.position} at {exp.company}</CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => removeExperience(index)}
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {exp.startDate || 'N/A'} - {exp.endDate || 'Present'}
                          </p>
                          <p className="mt-2">{exp.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                    <Card>
                      <CardHeader>
                        <CardTitle>Add New Experience</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="exp-company">Company</Label>
                              <Input 
                                id="exp-company" 
                                name="company" 
                                value={newExperience.company} 
                                onChange={handleExperienceChange} 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="exp-position">Position</Label>
                              <Input 
                                id="exp-position" 
                                name="position" 
                                value={newExperience.position} 
                                onChange={handleExperienceChange} 
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="exp-startDate">Start Date</Label>
                              <Input 
                                id="exp-startDate" 
                                name="startDate" 
                                type="date" 
                                value={newExperience.startDate} 
                                onChange={handleExperienceChange} 
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="endDate">End Date</Label>
                              <Input id="endDate" name="endDate" type="date" value={newExperience.endDate} onChange={handleExperienceChange} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea id="description" name="description" value={newExperience.description} onChange={handleExperienceChange} />
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                      <Button type="button" onClick={addExperience} className="w-full md:w-1/3 mx-auto">
                        <Plus className="mr-2 h-4 w-4" /> Add Experience
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              <Button type="submit" onClick={handleSubmit} disabled={isLoading} className="w-full bg-blue-600">
                {isLoading ? (
                  <>Updating... <ArrowRight className="ml-2 h-4 w-4 animate-spin " /></>
                ) : (
                  <>Update profile <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </form>

          </Tabs>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}