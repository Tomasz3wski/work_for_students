import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// @ts-ignore


export default function Navbar() {
	const navigate = useNavigate();

	const isLoggedIn = !!localStorage.getItem("userToken");


	const handleLogout = () => {
		localStorage.removeItem("userToken");
		window.location.reload();
	};

	return (
		<nav className='navbar'>
			<div
				className='nav-brand'
				onClick={() => navigate("/")}>
				Work For Students
			</div>


			<div className='nav-buttons'>
				{isLoggedIn ? (
					<button
						className='btn btn-secondary btn-sm'
						onClick={handleLogout}>
						Wyloguj
					</button>
				) : (
					<>
						<button
							className='btn btn-secondary btn-sm'
							onClick={() => navigate("/login")}>
							Zaloguj
						</button>
						<button
							className='btn btn-primary btn-sm'
							onClick={() => navigate("/register")}>
							Dołącz
						</button>
					</>
				)}
			</div>
		</nav>
	);
}
