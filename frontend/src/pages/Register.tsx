import { useState, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/auth";

export default function Register() {
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		userRole: "STUDENT",
		name: "",
		surname: "",
		companyName: "",
		nip: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleInputChange = (
		e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		setErrorMessage(null);
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setErrorMessage(null);

		// 1. Walidacja haseł
		if (formData.password !== formData.confirmPassword) {
			setErrorMessage("Hasła nie są identyczne!");
			return;
		}

		// 2. Walidacja NIP dla pracodawcy
		if (formData.userRole === "EMPLOYER") {
			const nipRegex = /^\d{10}$/;
			if (!nipRegex.test(formData.nip)) {
				setErrorMessage("NIP musi składać się z dokładnie 10 cyfr!");
				return;
			}
		}

		setIsSubmitting(true);

		try {
			const payload = {
				email: formData.email,
				password: formData.password,
				userRole: formData.userRole, 
				name: formData.name,         
				surname: formData.surname,  
				companyName: formData.companyName,
				nip: formData.nip
			};

			await authService.register(payload);

			alert("Konto założone pomyślnie! Możesz się zalogować.");
			navigate("/login");
		} catch (error: any) {
			setErrorMessage(error.message || "Nie udało się utworzyć konta.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className='auth-page-wrapper'>
			<div className='auth-card'>
				<h2>Dołącz do nas</h2>
				<p className='auth-subtitle'>Znajdź pracę lub pracownika.</p>

				{errorMessage && (
					<div
						style={{
							color: "#dc2626",
							background: "#fee2e2",
							padding: "10px",
							borderRadius: "4px",
							marginBottom: "15px",
							fontSize: "0.9rem",
							textAlign: "center",
						}}>
						{errorMessage}
					</div>
				)}

				<form
					className='auth-form'
					onSubmit={handleSubmit}>
					{/* Wybór roli */}
					<div className='form-group'>
						<label htmlFor='userRole'>Kim jesteś?</label>
						<select
							id='userRole'
							name='userRole'
							className='input-field'
							value={formData.userRole}
							onChange={handleInputChange}>
							<option value='STUDENT'>Student</option>
							<option value='EMPLOYER'>Pracodawca</option>
						</select>
					</div>

					{/* Pola dla STUDENTA */}
					{formData.userRole === "STUDENT" && (
						<>
							<div className='form-group'>
								<label htmlFor='name'>Imię</label>
								<input
									id='name'
									type='text'
									name='name'
									className='input-field'
									value={formData.name}
									onChange={handleInputChange}
									required
								/>
							</div>

							<div className='form-group'>
								<label htmlFor='surname'>Nazwisko</label>
								<input
									id='surname'
									type='text'
									name='surname'
									className='input-field'
									value={formData.surname}
									onChange={handleInputChange}
									required
								/>
							</div>
						</>
					)}

					{/* Pola dla PRACODAWCY */}
					{formData.userRole === "EMPLOYER" && (
						<>
							<div className='form-group'>
								<label htmlFor='companyName'>Nazwa firmy</label>
								<input
									id='companyName'
									type='text'
									name='companyName'
									className='input-field'
									value={formData.companyName}
									onChange={handleInputChange}
									required
								/>
							</div>

							<div className='form-group'>
								<label htmlFor='nip'>NIP</label>
								<input
									id='nip'
									type='text'
									name='nip'
									className='input-field'
									value={formData.nip}
									onChange={handleInputChange}
									maxLength={10}
									required
								/>
							</div>
						</>
					)}

					{/* Pola wspólne */}
					<div className='form-group'>
						<label htmlFor='email'>Email</label>
						<input
							id='email'
							type='email'
							name='email'
							className='input-field'
							value={formData.email}
							onChange={handleInputChange}
							required
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='password'>Hasło</label>
						<input
							id='password'
							type='password'
							name='password'
							placeholder='Min. 8 znaków'
							className='input-field'
							value={formData.password}
							onChange={handleInputChange}
							required
						/>
					</div>

					<div className='form-group'>
						<label htmlFor='confirmPassword'>Powtórz hasło</label>
						<input
							id='confirmPassword'
							type='password'
							name='confirmPassword'
							className='input-field'
							value={formData.confirmPassword}
							onChange={handleInputChange}
							required
						/>
					</div>

					<button
						type='submit'
						className='btn btn-primary btn-full'
						disabled={isSubmitting}>
						{isSubmitting ? "Tworzenie konta..." : "Zarejestruj się"}
					</button>
				</form>

				<div className='auth-footer'>
					Masz już konto?{" "}
					<span
						className='link'
						onClick={() => navigate("/login")}>
						Zaloguj się
					</span>
				</div>
			</div>
		</div>
	);
}
