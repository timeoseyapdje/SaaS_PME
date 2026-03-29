"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, Building2, Shield, Landmark, User, Palette, Pencil, Check } from "lucide-react";
import { BankAccount } from "@/types";
import { formatCurrency } from "@/lib/currency";
import { DEMO_EMAIL } from "@/lib/demo";
import { AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);

  // Company form
  const [companyName, setCompanyName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [registrationNo, setRegistrationNo] = useState("");
  const [taxId, setTaxId] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [savedCompany, setSavedCompany] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Profile form
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userCreatedAt, setUserCreatedAt] = useState("");

  // Personnalisation
  const [primaryColor, setPrimaryColor] = useState("#10b981");
  const [invoiceHeader, setInvoiceHeader] = useState("");
  const [invoiceFooter, setInvoiceFooter] = useState("");
  const [savedCustom, setSavedCustom] = useState(false);
  const [userPlan, setUserPlan] = useState("STARTER");

  useEffect(() => {
    // Load company data
    fetch("/api/settings/company")
      .then((r) => r.json())
      .then((data) => {
        if (data.name) {
          setCompanyName(data.name || "");
          setLegalName(data.legalName || "");
          setRegistrationNo(data.registrationNo || "");
          setTaxId(data.taxId || "");
          setCity(data.city || "");
          setPhone(data.phone || "");
          setEmail(data.email || "");
          setWebsite(data.website || "");
        }
      })
      .catch(() => {});

    // Load subscription plan
    fetch("/api/subscription")
      .then((r) => r.json())
      .then((data) => {
        setUserPlan(data.plan || "STARTER");
      })
      .catch(() => {});

    // Load profile data
    fetch("/api/settings/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.name) {
          setProfileName(data.name || "");
          setProfileEmail(data.email || "");
          setUserRole(data.role || "");
          setUserCreatedAt(data.createdAt || "");
        }
      })
      .catch(() => {});

    // Load bank accounts
    fetch("/api/treasury")
      .then((r) => r.json())
      .then((data) => {
        setAccounts(data.accounts || []);
      })
      .catch(() => {});
  }, []);

  async function handleSaveCompany(e: React.FormEvent) {
    e.preventDefault();
    setSavingCompany(true);
    try {
      const response = await fetch("/api/settings/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName,
          legalName,
          registrationNo,
          taxId,
          city,
          phone,
          email,
          website,
        }),
      });
      if (response.ok) {
        setSavedCompany(true);
        setTimeout(() => setSavedCompany(false), 3000);
      }
    } finally {
      setSavingCompany(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setSavingPassword(true);
    try {
      const response = await fetch("/api/settings/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.ok) {
        setPasswordSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        const err = await response.json();
        setPasswordError(err.error || "Erreur lors du changement");
      }
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess(false);
    setSavingProfile(true);

    try {
      const response = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileName, email: profileEmail }),
      });

      if (response.ok) {
        setProfileSuccess(true);
        setEditingProfile(false);
        setTimeout(() => setProfileSuccess(false), 3000);
      } else {
        const err = await response.json();
        setProfileError(err.error || "Erreur lors de la mise à jour");
      }
    } finally {
      setSavingProfile(false);
    }
  }

  const isDemo = session?.user?.email === DEMO_EMAIL;

  const roleLabels: Record<string, string> = {
    ADMIN: "Administrateur",
    ACCOUNTANT: "Comptable",
    VIEWER: "Lecteur",
  };

  return (
    <div>
      <Header title="Paramètres" subtitle="Configuration de votre espace" />
      <div className="p-6">
        {isDemo && (
          <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Mode Démonstration</p>
              <p className="text-xs text-amber-400/70">
                Vous utilisez un compte démo en lecture seule. Créez votre propre compte pour modifier les paramètres.
              </p>
            </div>
          </div>
        )}
        <Tabs defaultValue="company">
          <TabsList>
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Entreprise
            </TabsTrigger>
            <TabsTrigger value="fiscalite" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Fiscalité
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Landmark className="w-4 h-4" />
              Comptes bancaires
            </TabsTrigger>
            <TabsTrigger value="customization" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Personnalisation
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Mon profil
            </TabsTrigger>
          </TabsList>

          {/* Company tab */}
          <TabsContent value="company">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">
                  Informations de l&apos;entreprise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveCompany} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom commercial *</Label>
                      <Input
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Raison sociale</Label>
                      <Input
                        value={legalName}
                        onChange={(e) => setLegalName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>N° RCCM</Label>
                      <Input
                        placeholder="RC/YAO/..."
                        value={registrationNo}
                        onChange={(e) => setRegistrationNo(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>NIU</Label>
                      <Input
                        placeholder="Numéro d'Identification Unique"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Ville</Label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Téléphone</Label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email entreprise</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Site web</Label>
                      <Input
                        placeholder="https://www.entreprise.cm"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <Button type="submit" disabled={savingCompany || isDemo}>
                      {savingCompany ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {isDemo ? "Lecture seule (démo)" : "Enregistrer"}
                    </Button>
                    {savedCompany && (
                      <span className="text-sm text-green-600">
                        Modifications enregistrées !
                      </span>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fiscalité tab */}
          <TabsContent value="fiscalite">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">
                  Paramètres fiscaux
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-semibold text-blue-700 mb-2">
                      TVA - Taxe sur la Valeur Ajoutée
                    </p>
                    <p className="text-2xl font-bold text-blue-700">19,25%</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Taux légal en vigueur au Cameroun
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm font-semibold text-orange-700 mb-2">
                      IS - Impôt sur les Sociétés
                    </p>
                    <p className="text-2xl font-bold text-orange-700">33%</p>
                    <p className="text-xs text-orange-600 mt-1">
                      Taux appliqué sur le bénéfice net
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">
                    Calendrier fiscal
                  </p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span>Déclaration TVA mensuelle</span>
                      <span className="font-medium">
                        15 du mois suivant
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span>Déclaration IS annuelle</span>
                      <span className="font-medium">31 mars</span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50 rounded">
                      <span>Patente professionnelle</span>
                      <span className="font-medium">1er trimestre</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <strong>Note:</strong> Les taux fiscaux sont ceux en vigueur
                  au Cameroun conformément au Code Général des Impôts. Consultez
                  la DGI pour toute mise à jour.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bank accounts tab */}
          <TabsContent value="accounts">
            <Card className="mt-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Comptes bancaires</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = "/treasury")}
                >
                  Gérer la trésorerie
                </Button>
              </CardHeader>
              <CardContent>
                {accounts.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    Aucun compte configuré.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {accounts.map((acc) => (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium">{acc.name}</p>
                          <p className="text-xs text-gray-400">
                            {acc.type}
                            {acc.bankName && ` · ${acc.bankName}`}
                            {acc.isDefault && " · Compte principal"}
                          </p>
                        </div>
                        <p className="font-bold text-sm">
                          {formatCurrency(acc.balance, acc.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personnalisation tab */}
          <TabsContent value="customization">
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Personnalisation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userPlan !== "MAX" ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Palette className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Fonctionnalité réservée au plan Max</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Passez au plan Max pour personnaliser vos factures, couleurs et modèles.
                      </p>
                    </div>
                    <Button
                      onClick={() => window.location.href = "/subscription"}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Passer au plan Max
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Couleur principale */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">Couleur principale</h3>
                      <p className="text-xs text-muted-foreground">Couleur utilisée sur vos factures et documents.</p>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-12 h-12 rounded-lg cursor-pointer border border-border"
                        />
                        <div className="flex gap-2">
                          {["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"].map((color) => (
                            <button
                              key={color}
                              onClick={() => setPrimaryColor(color)}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                primaryColor === color ? "border-white scale-110" : "border-transparent"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <Input
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-28 h-10 text-sm"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Logo entreprise */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">Logo sur les factures</h3>
                      <p className="text-xs text-muted-foreground">Votre logo sera affiché en en-tête de chaque facture PDF.</p>
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
                          <p className="text-xs text-muted-foreground text-center">Logo</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Importer un logo
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* En-tête / pied de facture */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">En-tête personnalisé (factures)</Label>
                        <textarea
                          placeholder="Ex: Merci pour votre confiance..."
                          value={invoiceHeader}
                          onChange={(e) => setInvoiceHeader(e.target.value)}
                          rows={3}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Pied de page personnalisé</Label>
                        <textarea
                          placeholder="Ex: Conditions de paiement par défaut..."
                          value={invoiceFooter}
                          onChange={(e) => setInvoiceFooter(e.target.value)}
                          rows={3}
                          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                        />
                      </div>
                    </div>

                    <Separator />

                    {/* Modèle de facture */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">Modèle de facture</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {["Classique", "Moderne", "Minimal"].map((tpl) => (
                          <div
                            key={tpl}
                            className="border border-border rounded-xl p-4 text-center cursor-pointer hover:border-emerald-500/50 transition-colors"
                          >
                            <div className="h-24 bg-muted/30 rounded-lg mb-2 flex items-center justify-center">
                              <p className="text-xs text-muted-foreground">{tpl}</p>
                            </div>
                            <p className="text-xs font-medium text-foreground">{tpl}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        onClick={() => {
                          setSavedCustom(true);
                          setTimeout(() => setSavedCustom(false), 3000);
                        }}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Enregistrer la personnalisation
                      </Button>
                      {savedCustom && (
                        <span className="text-sm text-green-600">
                          Personnalisation enregistrée !
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile tab */}
          <TabsContent value="profile">
            <div className="mt-4 space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">
                    Informations du compte
                  </CardTitle>
                  {!editingProfile ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProfile(true)}
                      disabled={isDemo}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      {isDemo ? "Lecture seule" : "Modifier"}
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingProfile(false);
                        setProfileError("");
                        // Reset to current values
                        setProfileName(session?.user?.name || profileName);
                        setProfileEmail(session?.user?.email || profileEmail);
                      }}
                    >
                      Annuler
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  {profileError && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded mb-4">
                      {profileError}
                    </div>
                  )}
                  {profileSuccess && (
                    <div className="text-sm text-green-600 bg-green-50 p-3 rounded mb-4 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Profil mis à jour avec succès !
                    </div>
                  )}

                  {editingProfile ? (
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nom complet *</Label>
                          <Input
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            placeholder="Votre nom"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Adresse email *</Label>
                          <Input
                            type="email"
                            value={profileEmail}
                            onChange={(e) => setProfileEmail(e.target.value)}
                            placeholder="votre@email.com"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        <Button type="submit" disabled={savingProfile}>
                          {savingProfile ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Enregistrer
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-400 uppercase">
                          Nom
                        </Label>
                        <p className="text-sm font-medium mt-1">
                          {profileName || session?.user?.name || "—"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400 uppercase">
                          Email
                        </Label>
                        <p className="text-sm font-medium mt-1">
                          {profileEmail || session?.user?.email || "—"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400 uppercase">
                          Rôle
                        </Label>
                        <p className="text-sm font-medium mt-1">
                          {roleLabels[userRole] || userRole || "Utilisateur"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-400 uppercase">
                          Membre depuis
                        </Label>
                        <p className="text-sm font-medium mt-1">
                          {userCreatedAt ? new Date(userCreatedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Changer le mot de passe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleChangePassword}
                    className="space-y-4 max-w-sm"
                  >
                    {passwordError && (
                      <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                        {passwordError}
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
                        Mot de passe modifié avec succès !
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Mot de passe actuel</Label>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nouveau mot de passe</Label>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Confirmer le nouveau mot de passe</Label>
                      <Input
                        type="password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={savingPassword || isDemo}>
                      {savingPassword && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {isDemo ? "Non disponible (démo)" : "Modifier le mot de passe"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
