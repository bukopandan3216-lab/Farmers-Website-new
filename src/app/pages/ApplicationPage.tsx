import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

export function ApplicationPage() {
  const navigate = useNavigate();
  const [farmerForm, setFarmerForm] = useState({
    name: "",
    age: "",
    email: "",
    address: "",
    contactNumber: "",
    storeName: "",
    idType: "",
    validId: null as File | null,
    storePhoto: null as File | null,
    gcashNumber: "",
    paymayaNumber: ""
  });

  const [buyerForm, setBuyerForm] = useState({
    name: "",
    age: "",
    email: "",
    address: "",
    contactNumber: "",
    idType: "",
    validId: null as File | null,
    gcashNumber: "",
    paymayaNumber: ""
  });

  const handleFarmerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Farmer Application:", farmerForm);
    alert("Application submitted successfully! Please check your email for verification.");
    navigate("/signup");
  };

  const handleBuyerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Buyer Application:", buyerForm);
    alert("Application submitted successfully! Please check your email for verification.");
    navigate("/signup");
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="mb-4">Join FarmDirect</h1>
            <p className="text-muted-foreground">
              Apply as a farmer to sell your products or as a buyer to access fresh farm produce
            </p>
          </div>

          <Tabs defaultValue="farmer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="farmer">Farmer Application</TabsTrigger>
              <TabsTrigger value="buyer">Buyer Application</TabsTrigger>
            </TabsList>

            <TabsContent value="farmer">
              <Card>
                <CardHeader>
                  <CardTitle>Farmer Application Form</CardTitle>
                  <CardDescription>
                    Fill out the form below to start selling your products on FarmDirect
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFarmerSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="farmer-name">Full Name *</Label>
                        <Input
                          id="farmer-name"
                          value={farmerForm.name}
                          onChange={(e) => setFarmerForm({ ...farmerForm, name: e.target.value })}
                          placeholder="Juan Dela Cruz"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="farmer-age">Age *</Label>
                        <Input
                          id="farmer-age"
                          type="number"
                          value={farmerForm.age}
                          onChange={(e) => setFarmerForm({ ...farmerForm, age: e.target.value })}
                          placeholder="35"
                          min="18"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="farmer-email">Email Address *</Label>
                      <Input
                        id="farmer-email"
                        type="email"
                        value={farmerForm.email}
                        onChange={(e) => setFarmerForm({ ...farmerForm, email: e.target.value })}
                        placeholder="juan@example.com"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="farmer-address">Complete Address *</Label>
                      <Textarea
                        id="farmer-address"
                        value={farmerForm.address}
                        onChange={(e) => setFarmerForm({ ...farmerForm, address: e.target.value })}
                        placeholder="Barangay, Municipality, Province"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="farmer-contact">Contact Number *</Label>
                        <Input
                          id="farmer-contact"
                          type="tel"
                          value={farmerForm.contactNumber}
                          onChange={(e) => setFarmerForm({ ...farmerForm, contactNumber: e.target.value })}
                          placeholder="+63 917 123 4567"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="farmer-store">Store/Farm Name *</Label>
                        <Input
                          id="farmer-store"
                          value={farmerForm.storeName}
                          onChange={(e) => setFarmerForm({ ...farmerForm, storeName: e.target.value })}
                          placeholder="Fresh Harvest Farm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="farmer-id-type">ID Type *</Label>
                        <Select
                          value={farmerForm.idType}
                          onValueChange={(value) => setFarmerForm({ ...farmerForm, idType: value })}
                          required
                        >
                          <SelectTrigger id="farmer-id-type">
                            <SelectValue placeholder="Select ID type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="philsys">PhilSys ID (National ID)</SelectItem>
                            <SelectItem value="drivers-license">Driver's License</SelectItem>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="umid">UMID</SelectItem>
                            <SelectItem value="postal">Postal ID</SelectItem>
                            <SelectItem value="voters">Voter's ID</SelectItem>
                            <SelectItem value="prc">PRC ID</SelectItem>
                            <SelectItem value="senior-citizen">Senior Citizen ID</SelectItem>
                            <SelectItem value="pwd">PWD ID</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="farmer-id">Upload Valid ID *</Label>
                        <Input
                          id="farmer-id"
                          type="file"
                          onChange={(e) => setFarmerForm({ ...farmerForm, validId: e.target.files?.[0] || null })}
                          accept="image/*,.pdf"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="farmer-store-photo">Store/Farm Photo *</Label>
                      <Input
                        id="farmer-store-photo"
                        type="file"
                        onChange={(e) => setFarmerForm({ ...farmerForm, storePhoto: e.target.files?.[0] || null })}
                        accept="image/*"
                        required
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload a photo of your store or farm
                      </p>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="mb-4">Payment Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="farmer-gcash">GCash Number</Label>
                          <Input
                            id="farmer-gcash"
                            type="tel"
                            value={farmerForm.gcashNumber}
                            onChange={(e) => setFarmerForm({ ...farmerForm, gcashNumber: e.target.value })}
                            placeholder="+63 917 123 4567"
                          />
                        </div>
                        <div>
                          <Label htmlFor="farmer-paymaya">PayMaya Number</Label>
                          <Input
                            id="farmer-paymaya"
                            type="tel"
                            value={farmerForm.paymayaNumber}
                            onChange={(e) => setFarmerForm({ ...farmerForm, paymayaNumber: e.target.value })}
                            placeholder="+63 917 123 4567"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        At least one payment method is required
                      </p>
                    </div>

                    <Button type="submit" className="w-full">Submit Application</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="buyer">
              <Card>
                <CardHeader>
                  <CardTitle>Buyer Application Form</CardTitle>
                  <CardDescription>
                    Fill out the form below to start purchasing fresh produce from local farmers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBuyerSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="buyer-name">Full Name *</Label>
                        <Input
                          id="buyer-name"
                          value={buyerForm.name}
                          onChange={(e) => setBuyerForm({ ...buyerForm, name: e.target.value })}
                          placeholder="Maria Santos"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="buyer-age">Age *</Label>
                        <Input
                          id="buyer-age"
                          type="number"
                          value={buyerForm.age}
                          onChange={(e) => setBuyerForm({ ...buyerForm, age: e.target.value })}
                          placeholder="28"
                          min="18"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="buyer-email">Email Address *</Label>
                      <Input
                        id="buyer-email"
                        type="email"
                        value={buyerForm.email}
                        onChange={(e) => setBuyerForm({ ...buyerForm, email: e.target.value })}
                        placeholder="maria@example.com"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="buyer-address">Delivery Address *</Label>
                      <Textarea
                        id="buyer-address"
                        value={buyerForm.address}
                        onChange={(e) => setBuyerForm({ ...buyerForm, address: e.target.value })}
                        placeholder="House/Unit Number, Street, Barangay, City"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="buyer-contact">Contact Number *</Label>
                      <Input
                        id="buyer-contact"
                        type="tel"
                        value={buyerForm.contactNumber}
                        onChange={(e) => setBuyerForm({ ...buyerForm, contactNumber: e.target.value })}
                        placeholder="+63 917 123 4567"
                        required
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="buyer-id-type">ID Type *</Label>
                        <Select
                          value={buyerForm.idType}
                          onValueChange={(value) => setBuyerForm({ ...buyerForm, idType: value })}
                          required
                        >
                          <SelectTrigger id="buyer-id-type">
                            <SelectValue placeholder="Select ID type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="philsys">PhilSys ID (National ID)</SelectItem>
                            <SelectItem value="drivers-license">Driver's License</SelectItem>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="umid">UMID</SelectItem>
                            <SelectItem value="postal">Postal ID</SelectItem>
                            <SelectItem value="voters">Voter's ID</SelectItem>
                            <SelectItem value="prc">PRC ID</SelectItem>
                            <SelectItem value="senior-citizen">Senior Citizen ID</SelectItem>
                            <SelectItem value="pwd">PWD ID</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="buyer-id">Upload Valid ID *</Label>
                        <Input
                          id="buyer-id"
                          type="file"
                          onChange={(e) => setBuyerForm({ ...buyerForm, validId: e.target.files?.[0] || null })}
                          accept="image/*,.pdf"
                          required
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="mb-4">Payment Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="buyer-gcash">GCash Number</Label>
                          <Input
                            id="buyer-gcash"
                            type="tel"
                            value={buyerForm.gcashNumber}
                            onChange={(e) => setBuyerForm({ ...buyerForm, gcashNumber: e.target.value })}
                            placeholder="+63 917 123 4567"
                          />
                        </div>
                        <div>
                          <Label htmlFor="buyer-paymaya">PayMaya Number</Label>
                          <Input
                            id="buyer-paymaya"
                            type="tel"
                            value={buyerForm.paymayaNumber}
                            onChange={(e) => setBuyerForm({ ...buyerForm, paymayaNumber: e.target.value })}
                            placeholder="+63 917 123 4567"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        At least one payment method is required
                      </p>
                    </div>

                    <Button type="submit" className="w-full">Submit Application</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
